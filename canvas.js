var Canvas = function(div) {
  var ctx = div.getContext('2d'), x = 0;
  var width = div.width, height = div.height;
  console.log(width, height);
  this.addValue = function(val) {
    ++x;
    if (x > width) x = 0;
    ctx.arc(x, val * height , 10, 0, 2*Math.PI);
  }
};
