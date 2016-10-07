import React, { Component } from 'react';
import './App.css';

const style = require('ansi-styles');
const ansiHTML = require('ansi-html');
const emojione = require('emojione');
const Autolinker = require( 'autolinker' );
const escapeHtml = require('escape-html');

// vvvvvvvvvvv TEST CASES HERE vvvvvvvvvvv
const testCases = [
  'Hello ' + style.red.open + '<3 :heart:' + style.red.close + ' ' + style.green.open + '<strong>big http://google.com</strong> world' + style.green.close + '! 😄 :smile:',
  // TODO: more cases here
];
// ^^^^^^^^^^^ TEST CASES HERE ^^^^^^^^^^^



const rawAnsiText = style.green.open + 'Hello <strong>yellow</strong> world!' + style.green.close;
const parsedAnsiText = ansiHTML(rawAnsiText);
const componentAnsiText = <div className="component" dangerouslySetInnerHTML={{__html: parsedAnsiText}}></div>;

emojione.imageType = 'svg';
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

const testComponents = testCases.map(function(text) {
  const parsed = ansiHTML(emojione.toImage(Autolinker.link(escapeHtml(rawUnionText), linkerOptions)));
  return <div className="component" dangerouslySetInnerHTML={{__html: parsed}}></div>;
});;


class App extends Component {
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          <h1>Test Cases</h1>
          {testComponents}
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
        </p>
      </div>
    );
  }
}

export default App;
