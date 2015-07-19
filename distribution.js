/*
 * A simple class that calculates distribution over a set of params
 * string unit which is used with this distribution.
 */
function Distribution(unit) {
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
   *   unit : unit
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
        max : -Infinity,
        unit : unit
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
      params.stddev = Math.sqrt(params.stddev / params.size);
    }
    return params;
  };
}

/*
 * Push samples
 * Get distribution params
 */
function StreamedDistribution(unit) {
  var samples = [];

  this.push = function (sample) {
    samples.push(sample);
  };

  this.getParams = function () {
    var distribution = new Distribution(unit);
    distribution.setSamples(samples);
    return distribution.getParams();
  };
}


/**
 * Push time events. Samples are time differences between events.
 * Expected difference between intervals is passed in constructor.
 */
function StreamedIntervalDistribution(expectedInterval, unit) {
  var firstEvent = null,
      distribution = new StreamedDistribution(unit),
      params = {
        last_iteration : 0,
        iterations_missed : 0,
        iterations_hit : 0,
        hit_rate : null
      };

  this.push = function (t) {
    if (firstEvent == null) {
      firstEvent = t;
    }
    var iteration = Math.round((t - firstEvent) / expectedInterval);
    var expectedT = firstEvent + expectedInterval * iteration;
    distribution.push(expectedT - t);

    params.iterations_hit += 1;
    params.last_iteration = Math.max(params.last_iteration, iteration);
    params.hit_rate = params.iterations_hit / (params.last_iteration + 1);
    params.iterations_missed =
      params.last_iteration + 1 - params.iterations_hit;
  }

  this.getParams = function() {
    var result = {};
    var distParams = distribution.getParams();
    for (var key in params) {
      result[key] = params[key];
    }
    for (var key in distParams) {
      result[key] = distParams[key];
    }
    return result;
  }
}
