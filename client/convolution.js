// returns the convolution of two buffers.
// normalized to 1
function BufferConvolution(audioContext, bufferA, bufferB, reversed) {
  var cA = bufferA.getChannelData(0),
    cB = bufferB.getChannelData(0),
    len = cA.length,
    bufferSol = audioContext.createBuffer(2, cA.length * 2, bufferA.sampleRate),
    sol = new Float32Array(cA.length * 2),
    cL = bufferSol.getChannelData(0),
    cR = bufferSol.getChannelData(1),
    s;

  if (cA.length !== cB.length) {throw "give me same lengths";}

  function set(it, v) {solL[it] = solR[it] = v;}

  var mx = -1e12;
  for (var it = 0; it < 2 * len; ++it) {
    s = 0;
    for (var jt = Math.max(0, it - len + 1); jt < Math.min(len, it); ++jt) {
      if (jt < 0 || it - jt < 0 || jt >= len || it - jt >= len) {
        console.log(it, jt);
      }
      s += cA[jt] * cB[it - jt]
    }
    mx = Math.max(mx, s);
    // console.log( Math.max(0, it - len + 1), Math.min(len, it), s);
    if (reversed) {
      cL[2 * len - it - 1] = cR[2 * len - it - 1] = s;
    } else {
      cL[it] = cR[it] = s;
    }
  }
  for (var it = 0; it < 2 * len; ++it) {
    cL[it] /= mx;
    cR[it] /= mx;
  }
  return bufferSol;
}



