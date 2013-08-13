// return average and biased standard deviation from array of samples
exports.analyze = function(samples) {
  var N = samples.length, i, avg, std = 0;
  avg = samples.reduce(function(x, y) {return x + y;}) / N;
  for (i = 0; i < samples.length; ++i) {
    std += (samples[i] - avg) * (samples[i] - avg);
  }
  return {
    avg : avg,
    std : Math.sqrt(std / (samples.length - 1))
  };
};
