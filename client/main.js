function main(gui, audioContext) {
  var microphone,
    analyser,
    beeper,
    player,
    myId,
    ws,
    beepSignals = [null, null],
    isListener = false,
    networkReady = false;

  function onBeep(when) {
    if (networkReady) {
      gui.append('b! ');
      ws.sendType('on_beep', when);
    }
  }

  function onClose(e) {
    if (analyser) {
      analyser.stop();
    }
    if (e.reason) {
      gui.fatal(e.reason);
    } else {
      gui.fatal(e);
    }
  }

  function setUpNetwork() {
    ws = new SockWrapper(new WebSocket(config.server), onClose);
    ws.onClose(onClose);
    ws.onMessage('beep', function (when) {
      beeper.beep(config, when);
    });
    ws.onMessage('chunk', function (chunk) {
      gui.color('green');
      gui.status("client " + myId + ' - playing with '
                 + JSON.stringify(Object.keys(chunk.component)));
      player.addChunk(chunk);
    });
    ws.onMessage('clock', function (id) {
      myId = id;
      networkReady = true;
      gui.status(myId + (isListener ?
                 " is sending and listening for beeps.. " :
                 " is sending beeps.."));
      ws.sendType('clock', {localTime: microphone.getCurrentTime()});
    });
  };

  (function () { 
    audioContext.output = audioContext.createAnalyser();
    audioContext.output.connect(audioContext.destination);

    new Waveform(audioContext.output, document.getElementById('canvas'));
    beeper = new Beeper(audioContext, beepSignals[0], gui);
    player = new Player(audioContext, gui);

    microphone = new Microphone(audioContext, 
      function (e) {
        gui.background('gray');
        gui.log("this device can't be used as a listener: " + e);
        setUpNetwork();
      },
      function () {
        isListener = true;
        analyser = new QueueBeepDetector(microphone, onBeep, config);
        setUpNetwork();
      }
    );
  })();
}

