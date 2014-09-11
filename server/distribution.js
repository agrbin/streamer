function Distribution (samples, setParams) {
  var it, params = { mean : 0, dev : 0 };

  this.getMean = function () {
    return params.mean;
  };

  this.getDev = function () {
    return params.dev;
  };

  this.getParams = function () {
    return params;
  };

  this.scale = function (k) {
    return new Distribution(null, {
      mean : k * params.mean,
      dev : Math.abs(k) * params.dev
    });
  };

  this.sum = function (dist) {
    return new Distribution(null, {
      mean : params.mean + dist.getMean(),
      dev : Math.sqrt(
        Math.pow(params.dev, 2) +
        Math.pow(dist.getDev(), 2))
    });
  };

  if (setParams) {
    params = setParams;
  } else {
    for (it = 0; it < samples.length; ++it) {
      params.mean += samples[it];
    }
    params.mean /= samples.length;

    for (it = 0; it < samples.length; ++it) {
      params.dev += Math.pow(samples[it] - params.mean, 2);
    }
    params.dev = Math.sqrt(params.dev / samples.length);
  }
}

function stripOutliers(samples, keepRatio) {
  var it, copy = [], lo, len, m;
  for (it = 0; it < samples.length; ++it) {
    copy.push(samples[it]);
  }
  copy.sort(function (x, y) {
    return x - y;
  });
  m = Math.floor(copy.length / 2);
  lo = Math.ceil(m - (0.5 * keepRatio * copy.length));
  len = Math.ceil(keepRatio * copy.length);
  return copy.slice(lo, len);
}

module.exports.stripOutliers = stripOutliers;
module.exports.Distribution = Distribution;

/*
var d = new Distribution([1,-2,-2,-1,-1,-1,-1,-2,-2,-1,-1,-2,-1]);
console.log(d.getParams());
*/
