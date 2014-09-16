function ConvolverDetector(
  microphone,
  reversedBeepSignal,
  onBeep
) {
  var sideThreshold = 300,
      ratioThreshold = 200,
      powerMaxThreshold = 0.001,
      audioContext = microphone.getAudioContext(),
      procNode;

  function log(msg) {
    // be silent.
  }

  function getMaximumPower(input) {
    var it, power, ret = {power: 0, index: 0};
    for (it = 0; it < input.length; ++it) {
      power = input[it] * input[it];
      if (power > ret.power) {
        ret = {
          power: power,
          index: it,
        };
      }
    }
    return ret;
  }

  function getAveragePowerAroundPeak(input, maximum) {
    var averagePower = 0,
      lo = Math.max(0, maximum.index - 4 * sideThreshold)
      hi = Math.min(input.length, maximum.index + 4 * sideThreshold);
    for (;lo < hi; ++lo) {
      averagePower += input[lo] * input[lo];
    }
    return averagePower / input.length;
  }

  function processAudio(event) {
    var input = event.inputBuffer.getChannelData(0),
      output = event.outputBuffer.getChannelData(0),
      maximum = getMaximumPower(input),
      averagePower;

    if (maximum.power < powerMaxThreshold) {
      return;
    } else {
      log('heard signal in convolution');
    }

    averagePower = getAveragePowerAroundPeak(input, maximum);

    if (
      maximum.index > sideThreshold &&
      maximum.index < input.length - sideThreshold &&
      maximum.power / averagePower > ratioThreshold
    ) {
      return onBeep(
        (event.playbackTime + maximum.index / microphone.getSampleRate())
        * 1000
      );
    } else if (maximum.power / averagePower > ratioThreshold) {
      log('side fault');
    } else {
      log('averagePower fault');
    }
  }

  this.stop = function () {
    procNode.onaudioprocess = null;
  };

  (function () {
    convNode = audioContext.createConvolver();
    convNode.normalize = true;
    convNode.buffer = reversedBeepSignal;

    procNode = audioContext.createScriptProcessor(16384, 1, 1);
    procNode.onaudioprocess = processAudio;

    microphone.getInputNode().connect(convNode);
    convNode.connect(microphone.getSinkNode());
    loop();
  }());
}

