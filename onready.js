// Returned audioContext has analyser output that is connected to destination.
// So instead of connecting your network to destination, connect it to output.
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
    oscillator.noteOn ?
      oscillator.noteOn(0) :
      oscillator.start(0);
    oscillator.noteOff ?
      oscillator.noteOff(0.1) :
      oscillator.stop(0.1);
  }

  function createOutputAnalyser() {
    audioContextInstance.output = audioContextInstance.createAnalyser();
    audioContextInstance.output.connect(audioContextInstance.destination);
  }

  function windowReady() {
    var waitForAudio,
      gui = new Gui(document.getElementById("h1"));
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
        createOutputAnalyser();
        callback(gui, audioContextInstance);
      }
    }, 100);
  }

  window.addEventListener(getLoadEvent(), windowReady, false);
}

