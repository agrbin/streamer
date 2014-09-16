/*
  beepDuration : 500,
  beepFreqLow :  1000,
  beepFreqHigh : 5000,
  testBeepFreq : false,
  beepCode : [0,0.5,0.2,0.7,0.5,1],
 */
function QueueBeepDetector(
  microphone,
  onBeep,
  options
) {
  var spectrum = null,
    indexRange = [],
    freqSpan,
    timer,
    lastLoopCalled = 0;
    queueT = [],
    queueF = [],
    queueFull = false,
    threshold = 50,
    state = 0;
  var stateOneSnap;

  function assertHave(key, def) {
    if (!options[key]) {
      if (def) {
        options[key] = def;
      } else {
        throw key + " should be in options for sweep beep detector";
      }
    }
  }

  function findHighestFreqIndex() {
    var it, mx = -1e12, which = 0;
    for (it = indexRange[0]; it < indexRange[1]; ++it) {
      if (spectrum[it] > mx) {
        mx = spectrum[it]; 
        which = it;
      }
    }
    return which;
  }

  var x = 0;
  function drawDebug() {
    var ctx = options.gui.getContext();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    function transX(x) { return ctx.width / 2 + x * ctx.width / 2; }
    function transY(y) { return (1 - y) * ctx.height; }
    function point(x, y, r) {
      r = r|| 3;
      x = transX(x) - r/2;
      y = transY(y) - r/2;
      ctx.strokeStyle = 'navy';
      ctx.lineWidth = r;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.001, y);
      ctx.stroke();
    }
    function line(x1, y1, x2, y2) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(transX(x1), transY(y1));
      ctx.lineTo(transX(x2), transY(y2));
      ctx.stroke();
    }
    var s = getSample(), r = 3;
    if (s < threshold) {
      r = 5;
    }
    point(x, s / 3000, r);

    x += 0.005;
    if (x >= 1) {
      x = 0;
      ctx.clearRect(ctx.width / 2, 0, ctx.width, ctx.height);
    }

    ctx.clearRect(0, 0, ctx.width/2, ctx.height);
    for (it = 0; it < queueF.length; ++it) {
      point(-1 + it / queueF.length, (queueF[it] - indexRange[0]) / freqSpan);
    }
  }

  function calcNextDelay() {
    var sol = 0;
    sol += options.detectorSampleRate + lastLoopCalled;
    sol -= microphone.getCurrentTime();
    return sol > 0 ? sol : 0;
  }

  function getSample() {
    var it, err, sol = 0;
    for (it = 0; it < queueF.length; ++it) {
      err = (queueT[it] - queueT[0]) / options.beepDuration * freqSpan;
      err += indexRange[0];
      err -= queueF[it];
      sol += err * err;
    }
    return queueF.length ? sol / queueF.length : null;
  }

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

  function analyze() {
    var it, n = queueT.length - 1, s, samples = [], d;
    if (!n) {
      return;
    }
    for (it = 0; it < n; ++it) {
      s = (queueF[it] - indexRange[0]) / freqSpan;
      s *= options.beepDuration;
      s = queueT[it] - s;
      samples.push(s);
    }
    d = getDistribution(samples);
    onBeep(d.mean);
  }

  function loop() {
    var delay, s;
    lastLoopCalled = microphone.getCurrentTime();
    microphone.getByteSpectrum(spectrum);
    queueT.push(lastLoopCalled);
    queueF.push(findHighestFreqIndex());

    while (queueT[0] < lastLoopCalled - options.beepDuration) {
      queueFull = true;
      queueT.shift();
      queueF.shift();
    }

    if (queueFull) {
      s = getSample();
      if (state === 2 && s > threshold) {
        setTimeout(function () {
          state = 0;
        }, options.detectorRetain);
      }
      if (state === 1 && s > stateOneSnap) {
        analyze();
        state = 2;
      }
      if (state === 0 && s < threshold) {
        state = 1;
        stateOneSnap = s;
      }
    }

    timer = setTimeout(loop, calcNextDelay());
  }

  this.stop = function () {
    clearTimeout(timer);
  };

  (function () {
    spectrum = new Uint8Array(microphone.getDataLength());
    assertHave('beepFreqLow');
    assertHave('beepFreqHigh');
    assertHave('beepDuration');
    assertHave('detectorSampleRate');
    assertHave('detectorRetain');
    indexRange = [
      microphone.getIndexForFreq(options.beepFreqLow),
      microphone.getIndexForFreq(options.beepFreqHigh)
    ];
    freqSpan = indexRange[1] - indexRange[0];
    console.log(indexRange);
    loop();
  }());
}

