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

  function beepOnce(options, t) {
    var dur = options.beepDuration / 1000;
    oscillator.frequency.setValueAtTime(options.beepFreqLow, t);
    oscillator.frequency.linearRampToValueAtTime(options.beepFreqHigh, t + dur);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.010);
    gain.gain.linearRampToValueAtTime(1, t + dur);
    gain.gain.linearRampToValueAtTime(0, t + dur + 0.005);
  }

  this.beep = function (options, when) {
    if (!inBeep && !paused) {
      var t = (when / 1000) || audioContext.currentTime;
      if (t < audioContext.currentTime) {
        return gui.log('beep late for ' + (audioContext.currentTime - t));
      }

      //for (var i = 0; i < 20; ++i) {
        beepOnce(options, t);
      //}

      toggle();
      setTimeout(toggle, options.beepDuration);
    }
  };

  (function () {
    // create gain
    if (!audioContext.output) {
      audioContext.output = audioContext.destination;
    }
    gain = audioContext.createGain();
    gain.gain.value = 0;
    gain.connect(audioContext.output);
    // create oscillator
    oscillator = audioContext.createOscillator();
    oscillator.connect(gain);
    oscillator.noteOn(0);
  } ());

}

