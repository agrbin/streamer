function SweepBeepDetector(
  microphone,
  AnomalyDetector,
  onBeep,
  options
) {
  var anomalyDetector = null,
    spectrum = null,
    indexRange = [],
    analyzeEnd = null,
    data = [],
    partsLeft,
    stopped = false;

  function assertHave(key) {
    if (!options[key]) {
      throw key + " should be in options for sweep beep detector";
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

  function drawDebug(fit) {
    var ctx = options.debugCanvas,
      it, minT = 1e12, maxT = -1e12, n = data.x.length;

    for (it = 0; it < n; ++it) {
      minT = Math.min(minT, data.x[it]);
      maxT = Math.max(maxT, data.x[it]);
    }

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    function transX(x) {
      return ctx.width / 2 + (x - minT) / (maxT - minT) * ctx.width / 2;
    }
    function transY(y) {
      return (1 - y) * ctx.height;
    }

    // x i y from [0, 1]
    function point(x, y) {
      x = transX(x) - 5;
      y = transY(y) - 5;
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'navy';
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

    function f(x) {
      return Math.round(x * 100) / 100;
    }

    ctx.clearRect(ctx.width / 2, 0, ctx.width, ctx.height);
    var pts = [];
    for (it = 0; it < n; ++it) {
      point(data.x[it], data.y[it]);
    }

    line(minT, minT * fit.a1 + fit.a0,
         maxT, maxT * fit.a1 + fit.a0);
  }

  function normalizeData() {
    var it, x = [], y = [];
    //data = data.slice(0, -1);
    for (it = 0; it < data.length; ++it) {
      data[it].f = microphone.getFreqForIndex(data[it].f);
      data[it].f -= options.lowFreq;
      data[it].f /= (options.highFreq - options.lowFreq);
      x.push(data[it].t);
      y.push(data[it].f);
    }
    // strip the last point. it is usualy an outlier.
    data = {x:x, y:y};
  }

  function processData(anomalyStarted) {
    var lineFit,
      angleError,
      sol;

    normalizeData();
    lineFit = findLineByLeastSquares(data, 0.8);
    if (options.debugCanvas) {
      drawDebug(lineFit);
    }
    angleError = Math.pow(
      Math.atan(lineFit.a1 * options.sweepDuration) - (Math.PI / 4), 2
    );

    var l1 = 0.01, l2 = 0.01;
    if (lineFit.error < l1 && angleError < l2) {
      sol = -lineFit.a0 / lineFit.a1;
      if (Math.abs(sol - anomalyStarted < options.maxAnomalyError)) {
        onBeep(sol);
      } else {
        log('anomaly start mismatch: ' + (sol - anomalyStarted))
      }
    }
    anomalyDetector.start();
  }

  function log(x) {
    console.log(x);
  }

  function calcNextDelay() {
    if (!partsLeft) return -1;
    return Math.max(
      0,
      ((analyzeEnd - microphone.getCurrentTime()) / partsLeft--)
    );
  }

  function analyzeLoop(anomalyStarted) {
    var t = microphone.getByteSpectrum(spectrum),
      f = findHighestFreqIndex(),
      delay = calcNextDelay();
    data.push({t:t , f:f});
    if (t < analyzeEnd && delay != -1) {
      setTimeout(analyzeLoop.bind(this, anomalyStarted), delay);
    } else {
      processData(anomalyStarted);
    }
  }

  function onAnomaly(anomalyStarted) {
    if (stopped) {
      return;
    }
    data = [];
    analyzeEnd = microphone.getCurrentTime()
      + options.sweepDuration
      - 2 * options.anomalySampleInterval;
    partsLeft = options.freqParts;
    lastLoopCalled = microphone.getCurrentTime();
    analyzeLoop(anomalyStarted);
  }

  this.stop = function () {
    stopped = true;
  };

  (function () {
    spectrum = new Uint8Array(microphone.getDataLength());
    assertHave('lowFreq');
    assertHave('highFreq');
    assertHave('freqParts');
    assertHave('sweepDuration');
    assertHave('maxAnomalyError');
    assertHave('anomalySampleInterval');
    indexRange = [
      microphone.getIndexForFreq(options.lowFreq),
      microphone.getIndexForFreq(options.highFreq)
    ];
    anomalyDetector = new AnomalyDetector(microphone, onAnomaly, {
      lowFreq : options.lowFreq,
      highFreq : (options.lowFreq + options.highFreq) / 2,
      sampleInterval : options.anomalySampleInterval,
    });
  }());
}

