/**
 * this class will query spectrum at low sample rate (say 15ms) and when it
 * detects something that can be our beep will call onAnomaly callback.
 *
 * options is (and defaults) {
 *    lowFreq : 1e4
 *    highFreq : 2e4
 *    numberOfFreqsSampled : 20
 *    noiseSnapshotInterval : 1e4
 * }
 * ;
 *
 */
function AnomalyDetector(microphone, onAnomaly, options) {
  var lastNoiseCollected = -1e12,
    noiseDistribution = false,
    noiseDividerCounter = 0,
    spectrum = new Float32Array(microphone.getDataLength()),
    threshold = 1e12,
    noise = [],
    timer,
    opt = options || {};

  opt.retainInterval = opt.retainInterval || 300;
  opt.stdDevThreshold = opt.stdDevThreshold || 2.5;

  opt.lowFreq = opt.lowFreq || 1e4;
  opt.highFreq = opt.highFreq || 2e4;
  opt.numberOfFreqsSampled = opt.numberOfFreqsSampled || 40;

  opt.noiseSampleDivider = opt.noiseSampleDivider || 5;
  opt.numberOfNoiseSamples = opt.numberOfNoiseSamples || 20;

  opt.sampleInterval = opt.sampleInterval || 15;
  opt.noiseCollectInterval = opt.noiseCollectInterval || 1e4;

  // detector will became active in
  // (sampleInterval * noiseSampleDivider * numberOfNoiseSamples) ms
  opt.log = opt.log || function (msg) {console.log(msg);}

  function getDistribution(samples) {
    var it, params = { mean : 0, dev : 0 };
    for (it = 0; it < samples.length; ++it) {
      params.mean += samples[it];
    }
    params.mean /= samples.length;
    for (it = 0; it < samples.length; ++it) {
      params.dev += Math.pow(samples[it] - params.mean, 2);
    }
    params.dev = Math.sqrt(params.dev / samples.length);
    return params;
  }

  function getSample() {
    var it,
      lo = microphone.getIndexForFreq(opt.lowFreq),
      hi = microphone.getIndexForFreq(opt.highFreq),
      incr = (hi - lo) / opt.numberOfFreqsSampled,
      sol = 0;
    microphone.getFloatSpectrum(spectrum);

    for (it = lo; it < hi; it += incr) {
      sol += (spectrum[it] || 0);
    }
    return sol;
  }

  function mainLoop() {
    var t = microphone.getCurrentTime(),
      sample = getSample();

    if (noiseDividerCounter++ === opt.noiseSampleDivider) {
      noiseDividerCounter = 0;
      noise.push(sample);
      if (noise.length >= opt.numberOfNoiseSamples) {
        noiseDistribution = getDistribution(noise); 
        threshold = noiseDistribution.mean + noiseDistribution.dev * opt.stdDevThreshold;
        noise = [];
        noiseDividerCounter = NaN;
        setTimeout(function () {
          noiseDividerCounter = 0;
        }, options.noiseCollectInterval);
      }
    }

    if (sample > threshold) {
      onAnomaly(t);
    } else {
      setTimeout(mainLoop, options.anomalySampleInterval);
    }
  } 

  this.start = function () {
    mainLoop();
  };

  mainLoop();
}

