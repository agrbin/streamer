/*
 * Player class is responsible for scheduling and playing chunks of music
 * received from the server.
 *
 * Public interface is:
 *
 * (constructor)(getTime, volumeElement)
 *  getTime is function which returns a clock (see addChunk bellow)
 *  volumeElement is input range element for adjusting the volume.
 *
 * addChunk(msg)
 *  msg is socket message event. it will be typed as ArrayBuffer and it will
 *  consist of two parts. first one is mp3 encoded audio. last 13 bytes is an
 *  ASCII string representing the starting point in time (getTime() time)
 *  for received chunk. difference in starting times for two sequential chunks
 *  will be exactly the duration of one chunk. this duration is integral when
 *  represented in milliseconds. 
 *  the audioContext hardware clock and getTime() clock are synced only once,
 *  and because of that the scheduling is not affected by imprecise JavaScript
 *  clock.
 *  one can think of the time part in last 13 bytes as a sequential number of the
 *  chunk.
 */
var Player = function(getTime, volumeElement, colorElement) {

  var audioContext = new webkitAudioContext()
    , masterGain = null
    , timeOffset = null
    , warmUpCalled = false
    ; 

  // this is called only once to get the AudioContext started and to set up
  // master volume meter.
  // function will play a test note.
  (function() {
    if (warmUpCalled) return;
    else warmUpCalled = true;
    // set up master gain
    masterGain = audioContext.createGainNode();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 1;
    if (volumeElement) {
      volumeElement.style.display = 'block';
      volumeElement.addEventListener('change', function () {
        masterGain.gain.value = this.value;
      });
    }
    // play the number of the beast freq as a test note.
    // oscillator is a long word, isn't it?
    var oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 666;
    oscillator.connect(masterGain);
    oscillator.noteOn(0);
    oscillator.noteOff(0.01);
  })();

  var osc = null, oscGain = null;
  this.tick = function(when, freq, tickLength) {
    when = transponseTime(when);
    if (osc === null) {
      //
      oscGain = audioContext.createGainNode();
      oscGain.connect(audioContext.destination);
      oscGain.gain.value = 0;
      // 
      osc = audioContext.createOscillator();
      osc.frequency.value = freq;
      osc.connect(oscGain);
      osc.noteOn(0);
    }
    oscGain.gain.setValueAtTime(1, when);
    oscGain.gain.setValueAtTime(0, when + tickLength);
  };

  this.tickMultiple = function(freq, tickLength, num) {
    var t = audioContext.currentTime, j;
    for (j = 0; j < num; ++j) {
      var oscillator = audioContext.createOscillator();
      oscillator.frequency.value = freq;
      oscillator.connect(audioContext.destination);
      oscillator.noteOn(t + j);
      oscillator.noteOff(t + j + tickLength);
    }
  };

  // socket.onmessage will be binded to this method.
  // when message is received, start downloading mp3 chunk and decode it.
  this.addChunk = function(msg) {
    var request = new XMLHttpRequest();
    request.open('GET', msg.url, true);
    request.responseType = 'arraybuffer';
    request.addEventListener('load', function(evt) {
      if (evt.target.status != 200) return;
      audioContext.decodeAudioData(evt.target.response, function(decoded) {
        schedule(decoded, msg.start);
      });
    }, false);
    request.send();
  };

  // transponseTime transponses server time to the audioContext's time.
  // it will return -1 if audioContext is not ready yet.
  //
  // timeOffset is calculated only once because we want audioContext's time to
  // be in charge for scheduling completely. myClock is used only for
  // synchronization with server.
  // audioContext.currentTime is sleeping on zero for some time so we must
  // check this explicitly. 
  function transponseTime(srvTime) {
    if (timeOffset === null && audioContext.currentTime > 0) {
      timeOffset = (getTime() / 1000) - audioContext.currentTime;
    }
    if (timeOffset !== null) {
      return (srvTime / 1000) - timeOffset;
    } else {
      return -1;
    }
  }

  // to avoid 'click' sound between the chunks we did some overlaping of chunks
  // on the server side. in the first overlapTime of the chunk we are doing
  // fade in, and the fade out is done on the end.
  // as a result we have cross-fade effect.
  // server is configured for the overlaping time of 48ms, eg. 2 mp3 frames on
  // 48khz sampling.
  function schedule(buffer, srvTime) {
    var source = audioContext.createBufferSource()
      , gainNode = audioContext.createGainNode()
      , duration = buffer.duration
      , overlapTime = 0.048
      , startTime = transponseTime(srvTime);

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
      source.noteOn(startTime);
    }
  }

};

