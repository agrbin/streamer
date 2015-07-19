// http://stackoverflow.com/questions/979975/
//    how-to-get-the-value-from-the-url-parameter
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();


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

  function clearAllTimeouts() {
    var id = window.setTimeout(function() {}, 0);
    while (id--) {
      window.clearTimeout(id);
    }
  }

  function setUpTimeDriftDetector(gui, ctx) {
    var delta = null;
    var checkInterval = null;
    function getClocksDiff() {
      return ctx.currentTime * 1000 - new Date().getTime();
    }
    delta = getClocksDiff();
    checkInterval = setInterval(function () {
      var currentDrift = getClocksDiff() - delta;
      if (currentDrift > config.maximumClocksDriftMs) {
        gui.fatal("audioContext's clock and JavaScript's clock " +
          "no longer synced. Delta: " + currentDrift + " ms.");
        clearAllTimeouts();
      }
    }, 1000);
  }

  function importConfigOverrides() {
    for (var key in QueryString) {
      if (config.hasOwnProperty(key)) {
        config[key] = QueryString[key];
      }
    }
  }

  function windowReady() {
    importConfigOverrides();
    var waitForAudio,
      gui = new Gui(document.getElementById("h1"));
    window.removeEventListener(getLoadEvent(), windowReady);
    if (!AudioContext) {
      return gui.fatal("web audio not available");
    }
    gui.status('waiting on AudioContext to warm up.');
    audioContextInstance = new AudioContext();
    warmUpContext(audioContextInstance);
    // wait for audio context timer to start ticking.
    waitForAudio = setInterval(function () {
      if (audioContextInstance.currentTime > 1.0) {
        clearTimeout(waitForAudio);
        createOutputAnalyser();
        gui.status('ready');
        setUpTimeDriftDetector(gui, audioContextInstance);
        callback(gui, audioContextInstance);
      }
    }, 100);
  }

  window.addEventListener(getLoadEvent(), windowReady, false);
}

