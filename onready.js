function requireWarmAudioContextAndGui(callback) {
  var AudioContext =
    window.AudioContext ||
    window.webkitAudioContext,
    audioContextInstance;

  // some webaudio implementations don't let you play a sound without a user
  // event
  function getLoadEvent() {
    var sol = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ?
      'touchstart' : 'load';
    return sol;
  }

  // play the number of the beast freq as a test note.
  // oscillator is a long word, isn't it?
  function warmUpContext() {
    var oscillator = audioContextInstance.createOscillator();
    oscillator.frequency.value = 666;
    oscillator.connect(audioContextInstance.destination);
    oscillator.noteOn(0);
    oscillator.noteOff(0.1);
  }

  function windowReady() {
    var waitForAudio,
      gui = new Gui();
    window.removeEventListener(getLoadEvent(), windowReady);
    if (!AudioContext) {
      return gui.fatal("web audio not available");
    }
    gui.status('');
    audioContextInstance = new AudioContext();
    warmUpContext(audioContextInstance);
    // wait for audio context timer to start ticking.
    waitForAudio = setInterval(function () {
      if (audioContextInstance.currentTime > 0) {
        clearTimeout(waitForAudio);
        callback(gui, audioContextInstance);
      }
    }, 100);
  }

  window.addEventListener(getLoadEvent(), windowReady, false);
}

