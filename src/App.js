import React, { Component } from 'react';
import style from 'ansi-styles';

import './App.css';
import LogStatement from './LogStatement';

const testCases = [
    'hello ' + style.red.open + 'big ' + style.bgGreen.open + ' wide' + style.red.close + ' world' + style.bgGreen.close + ' finish',
    ['hello', 'world'],
    ['hello', 'world'],
    ['hello ' + style.red.open + '[big %s wide]' + style.red.close, 'huge'],
    ['hello', 'world', [{test:123}, {yellow:34}, {black:45}, {red:52}, {orange:788}]],
    ['hello', { scheme: 'monokai', author: 'wimer hazenberg (http://www.monokai.nl)', base00: '#272822', base01: '#383830', base02: '#49483e', base03: '#75715e', base04: '#a59f85', base05: '#f8f8f2', base06: '#f5f4f1', base07: '#f9f8f5', base08: '#f92672', base09: '#fd971f', base0A: '#f4bf75', base0B: '#a6e22e', base0C: '#a1efe4', base0D: '#66d9ef', base0E: '#ae81ff', base0F: '#cc6633' }],
    ['hello 😄 :smile: %s', 'world'],
    ['hello 😄 :smile: ' + style.red.open + '[big]' + style.red.close +' %s', 'world'],
    ['hello 😄 :smile: ' + style.red.open + '[big %s]' + style.red.close +' %s', 'large', 'world'],
    ['hello 😄 :smile: ' + style.red.open + '[big %s bold]' + style.red.close +' %s', 'large', 'world'],
    'Hello ' + style.red.open + '<3 :heart:' + style.red.close + ' ' + style.gray.open + '<strong>big http://google.com</strong> world' + style.gray.close + '! 😄 :smile:',
    'Long log message with white space\n    Long log message with white space Long log message with white space Long log message with white space Long log message with white space \n Long log message with white space \n\n  Long log message with white space',
    'Long log message with white space    Long log message with white space Long log message with white space Long log message with white space Long log message with white space Long log message with white space Long log message with white space',
    'xxxreallyLongxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    ['hello \n  step down\n    %s', 'world'],
    ['hello \n  step down\n    %s %o', 'world', [{test:123}, {yellow:34}, {black:45}, {red:52}, {orange:788}]],
    ['hello \n  step down %o\n    %s ', [{test:123}, {yellow:34}, {black:45}, {red:52}, {orange:788}], 'world']
];

let currentComponents = [];
const runTestCases = function() {
    currentComponents = testCases.map(function(content, index) {
      return <LogStatement content={content} key={index} />
    });
}
runTestCases();


class App extends Component {
    render() {
        return (
            <div className="App">
                <h1>Test Cases</h1>
                {currentComponents}
            </div>
        );
    }
}

export default App;
