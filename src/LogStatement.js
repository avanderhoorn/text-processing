import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import sprintfjs from './sprintfjs.js';

import JSONTree from 'react-json-tree';
import './LogStatement.css';

const ansiHTML = require('ansi-html');
const emojione = require('emojione');
const Autolinker = require( 'autolinker');
const escapeHtml = require('escape-html');

const theme = {
  scheme: 'default',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#181818',
  base01: '#282828',
  base02: '#383838',
  base03: '#585858',
  base04: '#b8b8b8',
  base05: '#d8d8d8',
  base06: '#e8e8e8',
  base07: '#f8f8f8',
  base08: '#ab4642',
  base09: '#dc9656',
  base0A: '#f7ca88',
  base0B: '#a1b56c',
  base0C: '#86c1b9',
  base0D: '#7cafc2',
  base0E: '#ba8baf',
  base0F: '#a16946'
};

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

    const startSprintfjs = window.performance.now();
    // intial pass if sprintfjs if needed
    if (typeof content !== 'string') {
        contentObj = sprintfjs(content[0], content.slice(1, content.length));

        // sad about this, wish I didn't have to do this
        content = contentObj.formattedResult.innerHTML;
    }
    else {
        content = escapeHtml(content);
    }
    const finishSprintfjs = window.performance.now();

    // additional pass to linkify, emojify and ansify
    // NOTE: random perf problems occur in here, hence perf tracking
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
    const startElement = window.performance.now();
    const contentElement = document.createElement('div');
    contentElement.innerHTML = parsed;
    contentElement.className = 'logStatement';
    const finishElement = window.performance.now();

    const startObject = window.performance.now();
    // additional inject objects if needed
    if (contentObj && contentObj.objects) {
        for (const objectKey in contentObj.objects) {
            if (objectKey) {
                const node = contentElement.querySelector('span[data-glimpse-object="' + objectKey + '"]');
                ReactDOM.render(<JSONTree data={contentObj.objects[objectKey]} shouldExpandNode={() => false} theme={theme} />, node);
            }
        }
    }
    const finishObject = window.performance.now();

    const finish = window.performance.now();

    return {
        node: contentElement,
        timer: {
            all: calulateTimer(start, finish),
            sprintfjs: calulateTimer(startSprintfjs, finishSprintfjs),
            linker: calulateTimer(startLinker, finishLinker),
            emoji: calulateTimer(startEmoji, finishEmoji),
            ansi: calulateTimer(startAnsi, finishAnsi),
            element: calulateTimer(startElement, finishElement),
            object: calulateTimer(startObject, finishObject)
        }
    };
}

class LogStatement extends Component {
    componentDidMount() {
        const result = process(this.props.content);
        this.refs.target.appendChild(result.node);

        const timer = result.timer;
        const timerShort = 'p:' + timer.sprintfjs + 'ms, l:' + timer.linker + 'ms, e:' + timer.emoji + 'ms, a:' + timer.ansi + 'ms, e:' + timer.element + 'ms, o:' + timer.object + 'ms';
        const timerLong = 'sprintfjs parsing:' + timer.sprintfjs + 'ms \nlinker parsing:' + timer.linker + 'ms \nemoji parsing:' + timer.emoji + 'ms \nansi parsing:' + timer.ansi + 'ms \nelement creation:' + timer.element + 'ms \nobject processing:' + timer.object + 'ms';

        const timerNode = document.createElement('span');
        timerNode.innerHTML = '<strong>' + timer.all + 'ms</strong> (' + timerShort + ')';
        timerNode.setAttribute('title', timerLong);
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
