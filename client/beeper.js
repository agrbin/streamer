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
    paused = false,
    that = this;

  function toggle() {
    inBeep ^= 1;
  }

  this.pause = function () {
    paused = true;
  };

  this.unpause = function () {
    paused = false;
  };

  function beepOnce(config, t) {
    var dur = config.beepDuration / 1000;
    oscillator.frequency.setValueAtTime(config.beepFreqLow, t);
    oscillator.frequency.linearRampToValueAtTime(config.beepFreqHigh, t + dur);

    /*
    // it seems that this doesn't change precission. this was to avoid the
    // click at the beginning of the beep.
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.010);
    gain.gain.linearRampToValueAtTime(1, t + dur);
    gain.gain.linearRampToValueAtTime(0, t + dur + 0.005);
    */
  }

  this.beep = function (config, when) {
    if (!paused) {
      var t = (when / 1000) || audioContext.currentTime;
      if (t < audioContext.currentTime) {
        return gui.log('beep late for ' + (audioContext.currentTime - t));
      }

      beepOnce(config, t);

      toggle();
      setTimeout(toggle, config.beepDuration);
    }
  };

  var beepRepeatedlyStartTime = 0;
  var beepRepeatedlyLastScheduledTime = 0;

  function checkBeepRepeatedlyQueue() {
    var t = audioContext.currentTime;
    var interval = config.beepRepeatedlyIntervalMs / 1000;
    while (beepRepeatedlyLastScheduledTime - t < 10 * interval) {
      beepRepeatedlyLastScheduledTime += interval;
      that.beep(config, beepRepeatedlyLastScheduledTime * 1000);
    }
  }

  this.beepRepeatedly = function (config) {
    var t0 = audioContext.currentTime + 1;
    // Send first beep in 1 second from now.
    beepRepeatedlyLastScheduledTime = t0;
    that.beep(config, t0 * 1000);
    setInterval(checkBeepRepeatedlyQueue, config.beepRepeatedlyIntervalMs);
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
    oscillator.noteOn ?
      oscillator.noteOn(0) :
      oscillator.start(0);
  } ());
}

