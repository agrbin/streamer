function main(gui, audioContext) {
  var clock,
    analyzer,
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
    analyzer.stop();
    gui.fatal(e);
  }

  audioContext.output = audioContext.createAnalyser();
  audioContext.output.connect(audioContext.destination);
  new Waveform(audioContext, audioContext.output,
               document.getElementById('canvas'));
  clock = new Clock(audioContext);
  beeper = new Beeper(audioContext, gui);
  analyzer = new Analyzer(audioContext, onBeep, onDeny,
                          clock, beeper, config, gui);
  player = new Player(audioContext, gui);
  ws = new SockWrapper(new WebSocket('ws://192.168.0.110:8080'), onClose);
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
    ws.sendType('clock', {localTime: clock.clock()});
  });
}

