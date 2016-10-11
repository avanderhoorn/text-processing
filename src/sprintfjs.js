const escapeHtml = require('escape-html');

function isDigitAt(string, index) {
    var c = string.charCodeAt(index);
    return (48 <= c && c <= 57);
}

function isWhitelistedProperty(property) {
    var prefixes = ['background', 'border', 'color', 'font', 'line', 'margin', 'padding', 'text', '-webkit-background', '-webkit-border', '-webkit-font', '-webkit-margin', '-webkit-padding', '-webkit-text'];
    for (var i = 0; i < prefixes.length; i++) {
        if (property.startsWith(prefixes[i]))
            return true;
    }
    return false;
}

const formatters = (function() {
    function parameterFormatter(force, obj, context, token) {
        context.objects['s' + token.substitutionIndex] = obj;

        const node = document.createElement('span');
        node.setAttribute('data-glimpse-object', 's' + token.substitutionIndex);

        return node;
    }

    function stringFormatter(value) {
        return value;
    }

    function floatFormatter(value) {
        if (typeof value !== 'number')
            return 'NaN';
        return value;
    }

    function integerFormatter(value) {
        if (typeof value !== 'number')
            return 'NaN';
        return Math.floor(value);
    }

    function bypassFormatter(value) {
        return (value instanceof Node) ? value : '';
    }

    function styleFormatter(value, context)
    {
        context.currentStyle = {};
        var buffer = document.createElement('span');
        buffer.setAttribute('style', value);
        for (var i = 0; i < buffer.style.length; i++) {
            var property = buffer.style[i];
            if (isWhitelistedProperty(property))
                context.currentStyle[property] = buffer.style[property];
        }
    }

    stringFormatter.className = 'token tokenString';
    floatFormatter.className = 'token tokenFloat';
    integerFormatter.className = 'token tokenInteger';

    return {
        o: parameterFormatter.bind(this, false),
        O: parameterFormatter.bind(this, true),
        s: stringFormatter,
        f: floatFormatter,
        i: integerFormatter,
        d: integerFormatter,
        c: styleFormatter,
        _: bypassFormatter
    };
})();

const append = (function() {
    function applyCurrentStyle(element, currentStyle)
    {
        // eslint-disable-next-line
        for (var key in currentStyle)
            element.style[key] = currentStyle[key];
    }

    return function(container, content, currentStyle, className) {
        if (content instanceof Node)
            container.appendChild(content);
        else if (typeof content !== 'undefined' && content !== '') {
            content = escapeHtml(content);

            var toAppend = undefined;
            if (className || currentStyle) {
                toAppend = document.createElement('span');
                toAppend.innerHTML = content;
                if (className)
                    toAppend.className = className;
                if (currentStyle)
                    applyCurrentStyle(toAppend, currentStyle);
            }
            else {
                toAppend = document.createTextNode(content);
            }
            container.appendChild(toAppend);
        }
        return container;
    };
})();

const tokenizeFormatString = function(format, formatters) {
    var tokens = [];
    var substitutionIndex = 0;

    function addStringToken(str) {
        if (tokens.length && tokens[tokens.length - 1].type === 'string')
            tokens[tokens.length - 1].value += str;
        else
            tokens.push({ type: 'string', value: str });
    }

    function addSpecifierToken(specifier, precision, substitutionIndex) {
        tokens.push({ type: 'specifier', specifier: specifier, precision: precision, substitutionIndex: substitutionIndex });
    }

    var index = 0;
    for (var precentIndex = format.indexOf('%', index); precentIndex !== -1; precentIndex = format.indexOf('%', index)) {
        if (format.length === index)  // unescaped % sign at the end of the format string.
            break;
        addStringToken(format.substring(index, precentIndex));
        index = precentIndex + 1;

        if (format[index] === '%') {
            // %% escape sequence.
            addStringToken('%');
            ++index;
            continue;
        }

        if (isDigitAt(format, index)) {
            // The first character is a number, it might be a substitution index.
            var number = parseInt(format.substring(index), 10);
            while (isDigitAt(format, index))
                ++index;

            // If the number is greater than zero and ends with a '$',
            // then this is a substitution index.
            if (number > 0 && format[index] === '$') {
                substitutionIndex = (number - 1);
                ++index;
            }
        }

        var precision = -1;
        if (format[index] === '.') {
            // This is a precision specifier. If no digit follows the '.',
            // then the precision should be zero.
            ++index;
            precision = parseInt(format.substring(index), 10);
            if (isNaN(precision))
                precision = 0;

            while (isDigitAt(format, index))
                ++index;
        }

        if (!(format[index] in formatters)) {
            addStringToken(format.substring(precentIndex, index + 1));
            ++index;
            continue;
        }

        addSpecifierToken(format[index], precision, substitutionIndex);

        ++substitutionIndex;
        ++index;
    }

    addStringToken(format.substring(index));

    return tokens;
}

const paramaterProcessor = function(element, parameters, context) {
    // Single parameter, or unused substitutions from above.
    for (let i = 0; i < parameters.length; ++i) {
        element.appendChild(document.createTextNode(' '));
        const node = document.createElement('span');
        const value = parameters[i];
        if (typeof value === 'string' || typeof value === 'number')
            node.innerHTML = escapeHtml(value);
         else {
            context.objects['p' + i] = value;
            node.setAttribute('data-glimpse-object', 'p' + i);
         }
         element.appendChild(node);
    }
}

const process = function(format, substitutions, context) {
    if (!format || !substitutions || !substitutions.length)
        return { formattedResult: append(context.root, format, context.currentStyle), unusedSubstitutions: substitutions };

    function prettyFunctionName() {
        return 'String.format("' + format + '", "' + Array.prototype.join.call(substitutions, '", "') + '")';
    }

    function warn(msg) {
        context.debug.push({ msg: prettyFunctionName() + ': ' + msg, type: 'warn' });
    }

    function error(msg) {
        context.debug.push({ msg: prettyFunctionName() + ': ' + msg, type: 'error' });
    }

    var result = context.root;
    var tokens = tokenizeFormatString(format, formatters);
    var usedSubstitutionIndexes = {};

    for (var i = 0; i < tokens.length; ++i) {
        var token = tokens[i];

        if (token.type === 'string') {
            result = append(result, token.value, context.currentStyle);
            continue;
        }

        if (token.type !== 'specifier') {
            error('Unknown token type "' + token.type + '" found.');
            continue;
        }

        if (token.substitutionIndex >= substitutions.length) {
            // If there are not enough substitutions for the current substitutionIndex
            // just output the format specifier literally and move on.
            error('not enough substitution arguments. Had ' + substitutions.length + ' but needed ' + (token.substitutionIndex + 1) + ', so substitution was skipped.');
            result = append(result, '%' + (token.precision > -1 ? token.precision : '') + token.specifier, context.currentStyle);
            continue;
        }

        usedSubstitutionIndexes[token.substitutionIndex] = true;

        if (!(token.specifier in formatters)) {
            // Encountered an unsupported format character, treat as a string.
            warn('unsupported format character \u201C' + token.specifier + '\u201D. Treating as a string.');
            result = append(result, substitutions[token.substitutionIndex], context.currentStyle);
            continue;
        }

        var formatter = formatters[token.specifier];
        result = append(result, formatter(substitutions[token.substitutionIndex], context, token), context.currentStyle, formatter.className);
    }

    var unusedSubstitutions = [];
    for (i = 0; i < substitutions.length; ++i) {
        if (i in usedSubstitutionIndexes)
            continue;
        unusedSubstitutions.push(substitutions[i]);
    }
    paramaterProcessor(result, unusedSubstitutions, context);

    return {
        formattedResult: result,
        unusedSubstitutions: unusedSubstitutions,
        debug: (context.debug.length > 0 ? context.debug : undefined),
        objects: (Object.keys(context.objects).length > 0 ? context.objects : undefined)
    };
}

export default function(format, parameters) {
    var context = {
        currentStyle: null,
        root: document.createElement('span'),
        debug: [],
        objects: {}
    }

    return process(format, parameters, context);
};
