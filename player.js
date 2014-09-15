/*
 * Player class is responsible for scheduling and playing chunks of music
 * received from the server.
 *
 * Public interface is:
 *
 * (constructor)(volumeElement)
 *  volumeElement is input range element for adjusting the volume.
 */
function Player(audioContext, gui) {

  var masterGain = null,
    timeOffset = null;

  // this is called only once to get the AudioContext started and to set up
  // master volume meter.
  // function will play a test note.
  (function() {
    // set up master gain
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.output);
    if (gui.volumeElement) {
      gui.volumeElement.style.display = 'block';
      gui.volumeElement.addEventListener('change', function () {
        masterGain.gain.value = this.value;
      });
    }
  })();

  var osc = null, oscGain = null;

  // socket.onmessage will be binded to this method.
  // when message is received, start downloading mp3 chunk and decode it.
  this.addChunk = function(msg) {
    var request = new XMLHttpRequest();
    request.open('GET', msg.url, true);
    request.responseType = 'arraybuffer';
    request.addEventListener('load', function(evt) {
      if (evt.target.status != 200) return;
      audioContext.decodeAudioData(evt.target.response, function(decoded) {
        schedule(decoded, msg.start / 1000);
      });
    }, false);
    request.send();
  };

  // to avoid 'click' sound between the chunks we did some overlaping of chunks
  // on the server side. in the first overlapTime of the chunk we are doing
  // fade in, and the fade out is done on the end.
  // as a result we have cross-fade effect.
  // server is configured for the overlaping time of 48ms, eg. 2 mp3 frames on
  // 48khz sampling.
  function schedule(buffer, startTime) {
    var source = audioContext.createBufferSource()
      , gainNode = audioContext.createGain()
      , duration = buffer.duration
      , overlapTime = 0.048;

    // connect the components
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(masterGain);
    // to avoid click! fade in and out
    gainNode.gain.linearRampToValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(1, startTime + overlapTime);
    gainNode.gain.linearRampToValueAtTime(1, startTime + duration -overlapTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // log some data.
    console.log(
      Math.round(audioContext.currentTime*100)/100 + ": scheduling chunk to "
      + Math.round(startTime*100)/100
    );
    // play the chunk if it is in the future
    if (startTime > 0) {
      source.noteOn ?
        source.noteOn(startTime) :
        source.start(startTime);
    }
  }

};

