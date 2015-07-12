function Spectogram(microphone, gui) {
  var microphone,
    spectrum,
    range;

  function getRange() {
    var arr, low, high;
    if (document.location.hash.substr(0, 7) === '#range=') {
      arr = document.location.hash.substr(7).split('-');
      if (arr.length === 2) {
        low = arr[0], high = arr[1];
        if (low < high && low >= 0 && high <= 30e3) {
          return range = [microphone.getIndexForFreq(low),
                  microphone.getIndexForFreq(high)];
        }
      }
    }
  }

  this.setRange = function (newRange) {
    var low = newRange[0], high = newRange[1];
    if (low < high && low >= 0 && high <= 30e3) {
      range = [microphone.getIndexForFreq(low),
               microphone.getIndexForFreq(high)];
    }
  };

  function drawSpectrum() {
    microphone.getByteSpectrum(spectrum, true);
    gui.drawBars(spectrum, microphone.getFreqForIndex, range);
    window.requestAnimationFrame(drawSpectrum);
  }

  (function () {
    spectrum = new Uint8Array(microphone.getDataLength());
    drawSpectrum();
    setInterval(getRange, 1000);
  })();
}
