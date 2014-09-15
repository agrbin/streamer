function Spectogram(audioContext, gui, onDeny) {
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

  function drawSpectrum() {
    microphone.getByteSpectrum(spectrum, true);
    gui.drawBars(spectrum, microphone.getFreqForIndex, range);
    window.requestAnimationFrame(drawSpectrum);
  }

  var last = 0;
  function blink(t) {
    console.log("asd " + (t - last));
    last = t;
  }

  microphone = new Microphone(audioContext, onDeny, function () {
    spectrum = new Uint8Array(microphone.getDataLength());
    setInterval(getRange, 1000);
    drawSpectrum();
  });
}

