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
  const parsed = ansiHTML(emojione.toImage(Autolinker.link(content, linkerOptions)));

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

  const timer = Math.round((window.performance.now() - start) * 1000) / 1000;
  console.log(timer);

  return contentElement;
}

class LogStatement extends Component {
  componentDidMount() {
    const node = process(this.props.content);
    this.refs.target.appendChild(node);
  }
  render() {
    return (
      <div className="holder">
        <div className="component" ref="target"></div><div className="timer">ms</div>
      </div>
    );
  }
}

export default LogStatement;
