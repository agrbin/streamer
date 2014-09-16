function ConvolverDetector(
  microphone,
  reversedBeepSignal,
  onBeep
) {
  var sideThreshold = 30,
      ratioThreshold = 30,
      powerMaxThreshold = 0.01,
      audioContext = microphone.getAudioContext(),
      analyserNode,
      input;

  function log(msg) {
    // be silent.
  }

  function getPowerAnalysis(input) {
    var it, power, ret = {maxValue: 0, maxIndex: 0, average: 0};
    for (it = 0; it < input.length; ++it) {
      power = input[it] * input[it];
      ret.average += power;
      if (power > ret.maxValue) {
        ret.maxValue = power;
        ret.maxIndex = it;
      }
    }
    ret.average /= input.length;
    return ret;
  }

  function processAudio() {
    var power = getPowerAnalysis(input);

    if (power.maxValue < powerMaxThreshold) {
      return;
    } else {
      log('heard signal in convolution');
    }

    if (
      power.maxIndex > sideThreshold &&
      power.maxIndex < input.length - sideThreshold &&
      power.maxValue / power.average > ratioThreshold
    ) {
      return power.maxIndex / microphone.getSampleRate();
    } else if (power.maxValue / power.average > ratioThreshold) {
      log('side fault');
      return -1; // delay next execution
    } else {
      log('power.average fault ', power.maxValue, power.maxValue / power.average);
    }
    return -2;
  }

  function loop() {
    var t0 = microphone.getCurrentTime(),
      beepStarted,
      delay;

    analyserNode.getFloatTimeDomainData(input);
    beepStarted = processAudio();
    if (beepStarted >= 0) {
      onBeep(t0 + beepStarted * 1000);
      delay = config.beepDuration;
    } else if (beepStarted === -1) {
      delay = config.beepDuration;
    } else if (beepStarted === -2) {
      delay = config.detectorSampleInterval;
    }
    setTimeout(loop, delay);
  }

  this.stop = function () {
    procNode.onaudioprocess = null;
  };

  (function () {
    input = new Float32Array(microphone.getDataLength());

    convNode = audioContext.createConvolver();
    convNode.normalize = true;
    convNode.buffer = reversedBeepSignal;

    analyserNode = audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0.0;

    microphone.getInputNode().connect(convNode);
    convNode.connect(analyserNode);
    analyserNode.connect(microphone.getSinkNode());

    loop();
  }());
}

