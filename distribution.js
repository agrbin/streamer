// just get the distribution params
function Distribution(transform) {
  var params = null,
    samples = [],
    that = this;

  transform = transform || function (x) {return x;};

  /**
   * sets the new samples
   */
  this.setSamples = function (s) {
    samples = [];
    for (var it = 0; it < s.length; ++it) {
      samples.push(transform(s[it]));
    }
    params = null;
    that.getParams();
  };

  this.getHist = function () {
    var N = 100;
    var agg = new Array(N);
    for (var it = 0; it < N; ++it) {
      agg[it] = 0;
    }
    for (var it = 0; it < samples.length; ++it) {
      agg[Math.round((samples[it] - params.mean) / params.dev * 5 + N / 2)]++;
    }

    function back(index) {
      return params.mean + params.dev * (index - N / 2) / 5;
    }

    return [agg, back];
  };

  /**
   * this will output params
   */
  this.getParams = function () {
    var it;
    if (params === null) {
      params = { mean : 0, dev : 0 };
      for (it = 0; it < samples.length; ++it) {
        params.mean += samples[it];
      }
      params.mean /= samples.length;

      for (it = 0; it < samples.length; ++it) {
        params.dev += Math.pow(samples[it] - params.mean, 2);
      }
      params.dev = Math.sqrt(params.dev / samples.length);
    }
    return params;
  };

  /**
   * is sample in population?
   */
  this.contains = function (sample) {
    return Math.abs(transform(sample) - params.mean) < 3 * params.dev;
  };
}

/*
  // erf implementation from
  // https://github.com/AndreasMadsen/mathfn/blob/master/functions/erf.js

  var ERF_A = [
    0.254829592,
    -0.284496736,
    1.421413741,
    -1.453152027,
    1.061405429
  ];
  var ERF_P = 0.3275911;

  function erf(x) {
    var sign = 1;
    if (x < 0) sign = -1;

    x = Math.abs(x);
    var t = 1.0/(1.0 + ERF_P*x);
    var y = 1.0 - (((((ERF_A[4]*t + ERF_A[3])*t) + ERF_A[2])*t +
                    ERF_A[1])*t + ERF_A[0])*t*Math.exp(-x*x);
    return sign * y;
  }
 */
