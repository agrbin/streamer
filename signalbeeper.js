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
function Beeper(audioContext, beepSignal, gui) {
  var gain,
    silence;

  this.beep = function (when) {
    var input, it, t, n = 1;
    for (it = 0; it < n; ++it) {
      t = (when || 0) / 1000;
      if (t < audioContext.currentTime) {
        gui.log('beep late for ' + (audioContext.currentTime - t));
      } else {
        input = audioContext.createBufferSource();
        input.buffer = beepSignal;
        input.connect(gain);
        input.start(t);
      }
    }
  };

  (function () {
    gain = audioContext.createGain();
    gain.gain.value = 0.5;
    gain.connect(
      audioContext.output || audioContext.destination
    );

    silence = audioContext.createBufferSource();
    silence.connect(gain);
    silence.loop = true;
    silence.start(0);
  }());
}

