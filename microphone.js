/**
 * this is a handy microphone class.
 */
function Microphone(audioContext, onDeny, onReady, options) {
  var node = null,
    opt = options || {},
    that = this,
    t0 = new Date().getTime();

  this.getCurrentTime = function () {
    return new Date().getTime() - t0;
    //return audioContext.currentTime * 1000;
  };

  this.getSampleRate = function () {
    return audioContext.sampleRate;
  };

  this.getFftSize = function () {
    return node.fftSize;
  };

  this.getDataLength = function () {
    return that.getFftSize() / 2;
  };

  this.getNode = function () {
    return node;
  }

  /**
   * next 4 functionsreturns audio context time right after data is taken.
   */
  this.getByteWaveform = function (wave) {
    if (!(wave instanceof Uint8Array)) {
      throw "spectrum should be Uint8Array";
    }
    that.getNode().getByteTimeDomainData(wave);
    return that.getCurrentTime();
  };

  this.getFloatWaveform = function (wave) {
    if (!(wave instanceof Float32Array)) {
      throw "spectrum should be Float32Array";
    }
    that.getNode().getFloatTimeDomainData(wave);
    return that.getCurrentTime();
  };

  this.getByteSpectrum = function (spectrum) {
    if (!(spectrum instanceof Uint8Array)) {
      throw "spectrum should be Uint8Array";
    }
    that.getNode().getByteFrequencyData(spectrum);
    return that.getCurrentTime();
  };

  /**
   * returns audio context time right after spectrum is taken.
   */
  this.getFloatSpectrum = function (spectrum) {
    if (!(spectrum instanceof Float32Array)) {
      throw "spectrum should be Float32Array";
    }
    that.getNode().getFloatFrequencyData(spectrum);
    return that.getCurrentTime();
  };

  this.getIndexForFreq = function (freq) {
    return Math.round(
      freq * node.fftSize / audioContext.sampleRate
    );
  };

  this.getFreqForIndex = function (index) {
    return Math.round(
      index / node.fftSize * audioContext.sampleRate
    );
  };

  function gotStream(stream) {
    var audioInput,
      zeroGain;

    // create analyser, non 
    node = audioContext.createAnalyser();
    node.fftSize = opt.fftSize || 2048;
    node.smoothingTimeConstant = opt.smoothingTimeConstant || 0.0;

    // Create an AudioNode from the stream.
    audioInput = audioContext.createMediaStreamSource(stream);
    audioInput.connect(node);

    // create zero gain
    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    node.connect(zeroGain);

    // sink
    zeroGain.connect(audioContext.destination);
    onReady(that);
  }

  (function () {
    var getMedia =
      (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

    if (!getMedia) {
      return onDeny("browser doesn't support user media");
    }

    getMedia.call(
      navigator,
      {audio:true},
      gotStream,
      onDeny
    );
  }());
}