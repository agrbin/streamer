function main(gui, audioContext) {
  var analyzer,
    beeper,
    player,
    myId,
    ws;

  function onBeep(when) {
    ws.sendType('on_beep', when);
  }

  function doBeep(when) {
    beeper.beep(config, when);
  }

  function onDeny(e) {
    gui.status(e);
    gui.background('gray');
    gui.log("this device can't be used as a listener");
  }

  function onClose(e) {
    if (analyzer) {
      analyzer.stop();
    }
    gui.fatal(e);
  }

  audioContext.output = audioContext.createAnalyser();
  audioContext.output.connect(audioContext.destination);
  microphone = new Microphone(audioContext, onDeny, function () {
    new Waveform(microphone, document.getElementById('canvas'));
    analyzer = new QueueBeepDetector(microphone, onBeep, config);
  });

  beeper = new Beeper(audioContext, gui);
  player = new Player(audioContext, gui);
  ws = new SockWrapper(new WebSocket(config.server), onClose);
  ws.onClose(onClose);

  ws.onMessage('beep', doBeep);
  ws.onMessage('chunk', function (chunk) {
    gui.color('green');
    gui.status("client " + myId + ' - playing with '
               + JSON.stringify(Object.keys(chunk.component)));
    if (config.testBeepFreq) {
      beeper.beep({beepDuration: config.beepDuration,
                  beepFreq: config.testBeepFreq}, chunk.start);
    } else {
      player.addChunk(chunk);
    }
  });
  ws.onMessage('clock', function (id) {
    myId = id;
    gui.status("client " + myId + " - sync in progress");
    ws.sendType('clock', {localTime: microphone.getCurrentTime()});
  });
}

