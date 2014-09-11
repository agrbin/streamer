function CanvasGui(canvas) {
  var that = this,
    ctx = canvas.getContext('2d'),
    width,
    height;

  function clean() {
    ctx.clearRect(0, height * 0.1, width, height);
  }

  this.status = function (msg) {
    ctx.fillStyle = 'black';
    ctx.font = '20px Verdana';
    ctx.clearRect(0, 0, width, height * 0.1);
    ctx.fillText(msg, 0, 0.1 * height);
  }

  this.drawDist = function (dist) {
    var tmp = dist.getHist();
    that.drawBars(tmp[0], tmp[1]);
  };

  this.drawBars = function (bars, calcFreq) {
    var it, n = bars.length,
      barSpacing = width / n,
      barWidth = 0.9 * barSpacing,
      h,
      gradient=ctx.createLinearGradient(0, 0, 0, height * 0.8),
      numLabels = 10,
      freq;

    gradient.addColorStop("1.0","blue");
    gradient.addColorStop("0.5","red");

    clean();
    ctx.fillStyle = gradient;
    for (it = 0; it < n; ++it) {
      h = (bars[it] / 255) * 0.8 * height;
      ctx.fillRect(it * barSpacing, height * 0.9 - h, barWidth, h);
    }

    if (calcFreq) {
      ctx.fillStyle = 'black';
      ctx.font = '12px Verdana';
      for (it = 0; it < n; it += Math.ceil(n / numLabels)) {
        freq = Math.round(calcFreq(it) * 1000) / 1000;
        ctx.fillText(freq, (it + 0.5) * barSpacing, height * 0.95);
      }
    }
  };

  this.onBeep = function () {
    ctx.fillRect(0, 0, width, height * 0.1);
    setTimeout(function () {
      ctx.clearRect(0, 0, width, 1 + height * 0.1);
    }, 500);
  };

  function resize() {
    width = canvas.width = window.innerWidth * 0.9;
    height = canvas.height = window.innerHeight * 0.9;
  }

  (function () {
    window.addEventListener('resize', resize, false);
    resize();
  })();
}


