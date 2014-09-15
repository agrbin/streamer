// snimam tisinu u 5 blokova.
// uzmem najtisi od tih 5 za tisinu.
// ako analyzer moze odustat od beepa

/**
 *  audioContext should be audio context.
 *
 *  onBeep is a callback that will be called when beep ocurs with only param
 *  that represents getTime() when beep started.
 *
 *  options are options:
 *    beepDuration
 *    beepFreq
 *    noiseFreq
 *
 *  gui methods:
 *    log (msg)
 *    drawBars (array)
 */

function Analyzer(
  audioContext,
  onBeep,
  onDeny,
  clock,
  beeper,
  options,
  gui
) {
  var analyserNode = null,
    lastNoiseCollected = -1e12,
    noiseSamples = false,
    energySamples = false,
    noiseCollected = false,
    noiseDistribution,
    clapDistribution,
    beepSamples = 0,
    beepDetected = 0,
    stopped = false,
    loopTimeout;

  function getIndexForFreq(freq) {
    return Math.round(
      freq * analyserNode.fftSize / audioContext.sampleRate
    );
  }


  function getEnergy(spectrum, freq1, freq2) {
    var f, sol = 0;
    for (f = getIndexForFreq(freq1); f <= getIndexForFreq(freq2); ++f) {
      sol += transformSample(spectrum[f]);
    }
    return sol;
  }

  function checkNoiseCollect(spectrum) {
    if (noiseSamples === false &&
        clock.clock() - lastNoiseCollected > options.noiseSnapshotInterval) {
      noiseSamples = [];
      energySamples = [];
      lastNoiseCollected = clock.clock();
      beeper.pause();
      console.log("noisce detect");
    }

    if (noiseSamples instanceof Array) {
      noiseSamples.push(spectrum[getIndexForFreq(options.noiseFreqHigh)]);
      energySamples.push(getEnergy(spectrum,
                                   options.noiseFreqLow,
                                   options.noiseFreqHigh));

      if (noiseSamples.length === options.noiseSamples) {
        console.log("done noise detection");
        beeper.unpause();
        noiseDistribution.setSamples(noiseSamples);
        clapDistribution.setSamples(energySamples);
        // gui.drawDist(noiseDistribution);
        noiseCollected = true;
        noiseSamples = false;
      }
    }
  }

  function loop() {
    var samplerate = audioContext.sampleRate,
      fftSize = analyserNode.fftSize,
      spectrum = new Float32Array(fftSize / 2);

    if (stopped) {
      return;
    }

    analyserNode.getFloatFrequencyData(spectrum);
    checkNoiseCollect(spectrum);

    if (noiseCollected) {
      var beepValue = spectrum[getIndexForFreq(options.beepFreq)];
      var clapValue = getEnergy(spectrum, options.noiseFreqLow,
                                options.noiseFreqHigh);

      if (clapDistribution.contains(clapValue) &&
          !noiseDistribution.contains(beepValue)) {
        beepSamples++;
        beepDetected = clock.clock();
      } else {
        beepSamples = 0;
      }

      if (beepSamples === 2) {
        beepSamples = 0;
        onBeep(beepDetected);
        loopTimeout = setTimeout(loop, options.beepSpacing);
        return;
      }
    }

    loopTimeout = setTimeout(loop, 10);
  }


  this.stop = function () {
    stopped = true;
    clearTimeout(loopTimeout);
  };

}
