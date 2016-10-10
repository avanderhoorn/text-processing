import React, { Component } from 'react';
import sprintfjs from './sprintfjs.js';

const ansiHTML = require('ansi-html');
const emojione = require('emojione');
const Autolinker = require( 'autolinker' );
const escapeHtml = require('escape-html');

// emojione settings
emojione.imageType = 'svg';
emojione.regShortNames = new RegExp("<object[^>]*>.*?</object>|<a[^>]*>.*?</a>|<(?:object|embed|svg|img|div|p|a)[^>]*>|("+emojione.shortnames+")", "gi");
emojione.regUnicode = new RegExp("<object[^>]*>.*?</object>|<a[^>]*>.*?</a>|<(?:object|embed|svg|img|div|p|a)[^>]*>|("+emojione.unicodeRegexp+")", "gi");
//emojione.imagePathSVG = ''; Set this to make path local

// linker settigns
const linkerOptions = { newWindow: true, phone: false, mention: false, hashtag: false };

function calulateTimer(start, finish) {
    return Math.round((finish - start) * 1000) / 1000;
}

function process(content) {
    const start = window.performance.now();

    let contentObj = undefined;

    // intial pass if sprintfjs if needed
    if (typeof content !== 'string') {
        contentObj = sprintfjs(content[0], content.slice(1, content.length));

        // sad about this, wish I didn't have to do this
        content = contentObj.formattedResult.innerHTML;
    }
    else {
        content = escapeHtml(content);
    }

    // additional pass to linkify, emojify and ansify
    // NOTE: random perf problems occur in here
    const startLinker = window.performance.now();
    let parsed = Autolinker.link(content, linkerOptions);
    const finishLinker = window.performance.now();
    const startEmoji = window.performance.now();
    parsed = emojione.toImage(parsed);
    const finishEmoji = window.performance.now();
    const startAnsi = window.performance.now();
    parsed = ansiHTML(parsed);
    const finishAnsi = window.performance.now();

    // setup holder which we can work with
    const contentElement = document.createElement('div');
    contentElement.innerHTML = parsed;

    // additional inject objects if needed
    if (contentObj && contentObj.objects) {
        for (const objectKey in contentObj.objects) {
            if (objectKey) {
                const node = contentElement.querySelector('span[data-glimpse-object="' + objectKey + '"]');
                node.innerHTML = JSON.stringify(contentObj.objects[objectKey]);
            }
        }
    }

    const finish = window.performance.now();

    return {
        node: contentElement,
        timer: {
            all: calulateTimer(start, finish),
            linker: calulateTimer(startLinker, finishLinker),
            emoji: calulateTimer(startEmoji, finishEmoji),
            ansi: calulateTimer(startAnsi, finishAnsi),
        }

    };
}

class LogStatement extends Component {
    componentDidMount() {
        const result = process(this.props.content);
        this.refs.target.appendChild(result.node);

        const timer = result.timer;
        const timerNode = document.createElement('span');
        timerNode.innerHTML = '<strong>' + timer.all + 'ms</strong> (l:' + timer.linker + 'ms, e:' + timer.emoji + 'ms, a:' + timer.ansi + 'ms)';
        this.refs.timer.appendChild(timerNode);
    }
    render() {
        return (
        <div className="holder">
            <div className="component" ref="target"></div><div className="timer" ref="timer"></div>
        </div>
        );
    }
}

export default LogStatement;
