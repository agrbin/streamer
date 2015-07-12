function Gui(canvasElem) {
  var h1 = document.getElementById("h1"),
    ctx = canvas.getContext('2d'),
    that = this,
    currentStatus = '';

  this.status = function (msg) {
    h1.innerHTML = currentStatus = msg;
  };

  this.append = function (a) {
    that.status(currentStatus + a);
  };

  this.color = function (color) {
    h1.style.color = color;
  };

  this.fatal = function (msg) {
    that.color('red');
    console.log("error: ", msg);
    that.status(msg);
  };

  this.getCanvasContext = function () {
    return ctx;
  };

  this.background = function (color) {
    document.getElementsByTagName('body')[0].style.backgroundColor = color;
  };

  this.log = function (msg) {
    console.log(msg);
  };

  this.drawBars = function (bars, calcFreq, range) {
    var it, n = bars.length,
      h,
      gradient=ctx.createLinearGradient(0, 0, 0, height * 0.8),
      numLabels = 10,
      freq,
      lo = range ? range[0] : 0,
      hi = range ? range[1] : n,
      barSpacing = width / (hi - lo),
      barWidth = 0.9 * barSpacing;

    gradient.addColorStop("1.0","blue");
    gradient.addColorStop("0.5","red");

    clean();
    ctx.fillStyle = gradient;

    for (it = lo; it < hi; ++it) {
      h = (bars[it] / 255) * 0.8 * height;
      ctx.fillRect((it - lo) * barSpacing, height * 0.9 - h, barWidth, h);
    }

    if (calcFreq) {
      ctx.fillStyle = 'black';
      ctx.font = '12px Verdana';
      for (it = lo; it < hi; it += Math.ceil((hi - lo) / numLabels)) {
        freq = Math.round(calcFreq(it) * 1000) / 1000;
        ctx.fillText(freq, ((it - lo) + 0.5) * barSpacing, height * 0.95);
      }
    }
  };

  function resize() {
    width = ctx.width = canvas.width = window.innerWidth * 0.9;
    height = ctx.height = canvas.height = window.innerHeight * 0.9;
  }

  function clean() {
    ctx.clearRect(0, height * 0.1, width, height);
  }

  (function () {
    window.addEventListener('resize', resize, false);
    resize();
  })();
}

