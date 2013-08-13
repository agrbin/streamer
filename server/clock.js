exports.clock = function() {
  return (new Date().getTime());
};

exports.Timer = function() {
  var start = null;
  this.reset = function() {
    start = exports.clock();
  };
  this.get = function() {
    return exports.clock() - start;
  };
  this.reset();
};
