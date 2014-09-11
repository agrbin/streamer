/*jslint indent: 2, plusplus: true*/
"use strict";

/**
 *  audioContext is audio context.
 *
 *  gui should have:
 *    log(msg)
 *    toggleBlink()
 *
 *  this.beep
 *    default options: see analyzer.js
 */
function Beeper(audioContext, gui) {
  var oscillator = null,
    gain = null,
    volume = 0.3,
    inBeep = false,
    paused = false;

  function toggle() {
    inBeep ^= 1;
  }

  this.pause = function () {
    paused = true;
  };

  this.unpause = function () {
    paused = false;
  };

  this.beep = function (options, when) {
    if (!inBeep && !paused) {
      var t = (when / 1000) || audioContext.currentTime,
        dur = options.beepDuration / 1000;
      if (t < audioContext.currentTime) {
        return gui.log('beep late for ' + (audioContext.currentTime - t));
      }
      // play the beep
      oscillator.frequency.value = options.beepFreq;
      gain.gain.setValueAtTime(volume, t);
      gain.gain.setValueAtTime(0.0, t + dur);
      /*
      gain.gain.linearRampToValueAtTime(0.1, t + dur * 0.45);
      gain.gain.linearRampToValueAtTime(0.9, t + dur * 0.5);
      gain.gain.linearRampToValueAtTime(0.1, t + dur * 0.55);
      gain.gain.linearRampToValueAtTime(0.0, t + dur * 1.0);
      */
      // toggle inBeep variable
      toggle();
      setTimeout(toggle, options.beepDuration);
    }
  };

  (function () {
    // create gain
    gain = audioContext.createGain();
    gain.gain.value = 0;
    gain.connect(audioContext.output);
    // create oscillator
    oscillator = audioContext.createOscillator();
    oscillator.connect(gain);
    oscillator.noteOn(0);
  } ());

}

