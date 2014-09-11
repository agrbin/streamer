function Waveform(audioContext, analyserNode, canvas) {
  var that = this,
    ctx = canvas.getContext('2d'),
    width,
    height;

  this.drawBars = function (wave) {
    var it, n = wave.length, path;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    for (it = 0; it < n; ++it) {
      ctx.lineTo(it / n * width, (wave[it] / 255) * height);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#5f5';
    ctx.stroke();
  };

  function drawWaveform() {
    var wave = new Uint8Array(analyserNode.fftSize / 2);
    analyserNode.getByteTimeDomainData(wave);
    that.drawBars(wave);
    window.requestAnimationFrame(drawWaveform);
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  (function () {
    window.addEventListener('resize', resize, false);
    window.requestAnimationFrame(drawWaveform);
    resize();
  })();

}


