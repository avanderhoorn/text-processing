import React, { Component } from 'react';
import './App.css';
import sprintfjs from './sprintfjs.js';

const style = require('ansi-styles');
const ansiHTML = require('ansi-html');
const emojione = require('emojione');
const Autolinker = require( 'autolinker' );
const escapeHtml = require('escape-html');


const testCases = [
  ['This is 😄 :smile: a %s', 'te  😄 st'],
  'Hello ' + style.red.open + '<3 :heart:' + style.red.close + ' ' + style.green.open + '<strong>big http://google.com</strong> world' + style.green.close + '! 😄 :smile:'
];


const rawAnsiText = style.green.open + 'Hello <strong>yellow</strong> world!' + style.green.close;
const parsedAnsiText = ansiHTML(rawAnsiText);
const componentAnsiText = <div className="component" dangerouslySetInnerHTML={{__html: parsedAnsiText}}></div>;

emojione.imageType = 'svg';
emojione.regShortNames = new RegExp("<object[^>]*>.*?</object>|<a[^>]*>.*?</a>|<(?:object|embed|svg|img|div|p|a)[^>]*>|("+emojione.shortnames+")", "gi");
emojione.regUnicode = new RegExp("<object[^>]*>.*?</object>|<a[^>]*>.*?</a>|<(?:object|embed|svg|img|div|p|a)[^>]*>|("+emojione.unicodeRegexp+")", "gi");
//emojione.imagePathSVG = ''; Set this to make path local
const rawEmojiText = 'Hello <3 world! 😄 :smile:';
const parsedEmojiText = emojione.toImage(rawEmojiText);
const componentEmojiText = <div className="component" dangerouslySetInnerHTML={{__html: parsedEmojiText}}></div>;

const linkerOptions = { newWindow: true, phone: false, mention: false, hashtag: false };
const rawLinkerText = 'Link1: http://google.com, Link2: www.google.com & Link3: google.com';
const parsedLinkerText = Autolinker.link(rawLinkerText, linkerOptions);
const componentLinkerText = <div className="component" dangerouslySetInnerHTML={{__html: parsedLinkerText}}></div>;

const rawHtmlText = '<3 Hello <strong>yellow</strong> world!';
const parsedHtmlText = escapeHtml(rawHtmlText);
const componentHtmlText = <div className="component" dangerouslySetInnerHTML={{__html: parsedHtmlText}}></div>;

const rawUnionText = 'Hello ' + style.red.open + '<3 :heart:' + style.red.close + ' ' + style.green.open + '<strong>big http://google.com</strong> world' + style.green.close + '! 😄 :smile:';
const parsedUnionText = ansiHTML(emojione.toImage(Autolinker.link(escapeHtml(rawUnionText), linkerOptions)));
const componentUnionText = <div className="component" dangerouslySetInnerHTML={{__html: parsedUnionText}}></div>;


let currentComponents = [];
let currentRender = null;
let timerAll = 0;

const runTestCases = function() {
  const startAll = window.performance.now()
  currentComponents = testCases.map(function(content, index) {
    const start = window.performance.now()
    if (typeof content !== 'string') {
      content = sprintfjs(content[0], content.slice(1, content.length));
    }
    else {
      content = escapeHtml(content);
    }
    const parsed = currentRender(content);
    const timer = Math.round((window.performance.now() - start) * 1000) / 1000;
    return <div className="holder" key={index}><div className="component" dangerouslySetInnerHTML={{__html: parsed}}></div><div className="timer">{timer}ms</div></div>;
  });
  timerAll = Math.round((window.performance.now() - startAll) * 1000) / 1000;
}

const renderOptions = {
  'link': function(text) { return Autolinker.link(text, linkerOptions); },
  'ansi': function(text) { return ansiHTML(text); },
  'emoji': function(text) { return emojione.toImage(text); },
  'all': function(text) { return ansiHTML(emojione.toImage(Autolinker.link(text, linkerOptions))); }
}
const setRenderer = function(target) {
  currentRender = renderOptions[target];
}

setRenderer('all');
runTestCases();


class App extends Component {
  _changeTestCase(target) {
    setRenderer(target);
    runTestCases();

    this.setState({ target });
  }
  render() {
    return (
      <div className="App">
        <h1>Test Cases - {timerAll}ms</h1>
        <ul className="options">
          <li><input type="radio" onClick={() => this._changeTestCase('all')} name="type" /> All</li>
          <li><input type="radio" onClick={() => this._changeTestCase('link')} name="type" /> Autolinker</li>
          <li><input type="radio" onClick={() => this._changeTestCase('ansi')} name="type" /> Ansi</li>
          <li><input type="radio" onClick={() => this._changeTestCase('emoji')} name="type" /> Emoji</li>
        </ul>
        {currentComponents}
        <hr />
        <h2>Union Text</h2>
        <div className="raw">{rawUnionText}</div>
        <div className="parsed">{parsedUnionText}</div>
        {componentUnionText}
        <hr />
        <h2>Escape Text</h2>
        <div className="raw">{rawHtmlText}</div>
        <div className="parsed">{parsedHtmlText}</div>
        {componentHtmlText}
        <h2>Linker Text</h2>
        <div className="raw">{rawLinkerText}</div>
        <div className="parsed">{parsedLinkerText}</div>
        {componentLinkerText}
        <h2>Ansi Text</h2>
        <div className="raw">{rawAnsiText}</div>
        <div className="parsed">{parsedAnsiText}</div>
        {componentAnsiText}
        <h2>Emoji Text</h2>
        <div className="raw">{rawEmojiText}</div>
        <div className="parsed">{parsedEmojiText}</div>
        {componentEmojiText}
      </div>
    );
  }
}

export default App;
