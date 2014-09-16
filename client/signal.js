function createSignal(
  audioContext,
  code,
  duration,
  lowFreq,
  highFreq,
  reversed
) {
  var sampleRate = audioContext.sampleRate,
    length = sampleRate * duration / 1000,
    buffer = audioContext.createBuffer(2, length, sampleRate),
    data = buffer.getChannelData(0);

  function sweep(getFreq, from, to) {
    var lo = Math.floor(from * sampleRate),
      hi = Math.floor(to * sampleRate),
      it;

    for (it = lo; it < hi; ++it) {
      data[reversed ? length - it - 1 : it] = Math.sin(
        (it / sampleRate) *
        Math.PI * 2 *
        getFreq((it - lo) / (hi - lo))
      );
    }
  }

  function buildTones() {
    for (it = 0; it < code.length; ++it) {
      sweep(
        function (x) {
          return lowFreq + code[it] * (highFreq - lowFreq) - x * 200;
        },
        it / code.length * duration / 1000,
        (it + 1) / code.length * duration / 1000
      );
    }
  }

  function copyToRight() {
    var dataR = buffer.getChannelData(1);
    for (it = 0; it < length; ++it) {
      dataR[it] = data[it];
    }
  }

  buildTones();
  copyToRight();
  return buffer;
}
