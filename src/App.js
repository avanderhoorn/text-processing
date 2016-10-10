import React, { Component } from 'react';
import style from 'ansi-styles';

import './App.css';
import LogStatement from './LogStatement';

const testCases = [
    ['hello', 'world'],
    ['hello', 'world', {test:123}],
    ['hello 😄 :smile: %s', 'world'],
    ['hello 😄 :smile: ' + style.red.open + '[big]' + style.red.close +' %s', 'world'],
    ['hello 😄 :smile: ' + style.red.open + '[big %s]' + style.red.close +' %s', 'large', 'world'],
    ['hello 😄 :smile: ' + style.red.open + '[big %s bold]' + style.red.close +' %s', 'large', 'world'],
    'Hello ' + style.red.open + '<3 :heart:' + style.red.close + ' ' + style.gray.open + '<strong>big http://google.com</strong> world' + style.gray.close + '! 😄 :smile:'
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
