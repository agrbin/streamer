var Listener = function(freq){
  var audioContext = new webkitAudioContext();
  var analyserNode = null;
  var freqByteData = null;
  var inputPoint = null;
  var lastLog = 0;
  var start = 0;
  var that = {};
  var intervalID = null;
  var ready = false;
  var onBeepCalled = false;
  var ob_callback = null;
  var ob_interval = null;

  that.onBeep = function(callback, interval) {
    ob_callback = callback;
    ob_interval = interval;
    if (ready === true) {
      updateAnalyser();
    } else {
      onBeepCalled = true;
    }
  }

  function updateAnalyser(){
    analyserNode.getByteFrequencyData(freqByteData);
    var samplerate = audioContext.sampleRate;
    var fftsize = analyserNode.fftSize;
    var antifreqs = [freq - 500, freq + 500];

    var sound = freqByteData[Math.round(freq * fftsize / samplerate)];
    for (var i = 0; i < antifreqs.length; i++) {
      sound -= freqByteData[Math.round(antifreqs[i] * fftsize / samplerate)];
    };

    if (sound > 5  && (Date.now() - lastLog) > ob_interval) {
      lastLog = Date.now();
      ob_callback();
    }
    intervalID = window.setTimeout(updateAnalyser, 0);
  }

  function gotStream(stream, callback) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    audioInput = audioContext.createMediaStreamSource(stream);
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    start = Date.now();
    freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
    ready = true;
    if (onBeepCalled === true) {
      that.onBeep(ob_callback, ob_interval);
    }
  }

  navigator.webkitGetUserMedia(
    {audio:true},
    gotStream,
    function(e) {
      alert('Error getting audio');
      console.log(e);
    }
  );

  return that;
};