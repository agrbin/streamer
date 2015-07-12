function CanvasGui(canvas) {
  var that = this,
    width,
    height;

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

  this.onBeep = function () {
    ctx.fillRect(0, 0, width, height * 0.1);
    setTimeout(function () {
      ctx.clearRect(0, 0, width, 1 + height * 0.1);
    }, 500);
  };

}


