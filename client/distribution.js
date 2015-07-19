/*
 * A simple class that calculates distribution over a set of params
 */
function Distribution() {
  var params = null,
    samples = [],
    that = this;

  /**
   * sets the new samples
   */
  this.setSamples = function (s) {
    samples = [];
    for (var it = 0; it < s.length; ++it) {
      samples.push(s[it]);
    }
    params = null;
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
   * {
   *   size :
   *   avg :
   *   stddev :
   *   min :
   *   max :
   *
   * }
   */
  this.getParams = function () {
    var it;
    if (params === null) {
      params = {
        avg : 0,
        stddev : 0,
        size : samples.length,
        min : Infinity,
        max : -Infinity
      };
      for (it = 0; it < samples.length; ++it) {
        var s = samples[it];
        params.avg += s;
        params.min = Math.min(params.min, s);
        params.max = Math.max(params.max, s);
      }
      params.avg /= params.size;
      for (it = 0; it < samples.length; ++it) {
        params.stddev += Math.pow(samples[it] - params.avg, 2);
      }
      params.stddev = Math.sqrt(params.dev / params.size);
    }
    return params;
  };
}

/*
 * Push samples
 * Get distribution params
 */
function StreamDistribution() {
  var samples = [];

  this.push = function (sample) {
    samples.push(sample);
  };

  this.getParams = function () {
    var distribution = new Distribution(samples);
    return distribution.getParams();
  };
}

