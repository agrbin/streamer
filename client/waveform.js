function Waveform(analyserNode, canvas) {
  var that = this,
    ctx = canvas.getContext('2d'),
    wave,
    width,
    height;

  this.drawWave = function (wave) {
    var it, n = wave.length;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    for (it = 0; it < n; it += 10) {
      ctx.lineTo(it / n * width, (wave[it] / 255) * height);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#5f5';
    ctx.stroke();
  };

  function drawWaveform() {
    analyserNode.getByteTimeDomainData(wave);
    that.drawWave(wave);
    window.requestAnimationFrame(drawWaveform);
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  (function () {
    wave = new Uint8Array(analyserNode.frequencyBinCount);
    window.addEventListener('resize', resize, false);
    window.requestAnimationFrame(drawWaveform);
    resize();
  })();

}


