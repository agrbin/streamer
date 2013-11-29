function Client(ws, player) {
  var BEEP_LENGTH_MS = 100;

  var id = null, canPlay = false;
  mysend(ws, ["client", navigator.userAgent]);

  myrecv(ws, function(msg) {
    id = msg;
    shout("client " + id);
    log("client " + id + " inited");
    beClient();
  });

  function handlePlay(offsets) {
    if (id in offsets) {
      shout("I will plays!");
      myClock.skew(offsets[id]);
      canPlay = true;
    } else {
      shout("I was kicked out :(");
    }
  }

  function beClient() {
    myrecv(ws, function(msg) {
      if ('offsets' in msg) {
        handlePlay(msg.offsets);
        return;
      }
      if ('url' in msg) {
        if (canPlay) {
          player.addChunk(msg);
        }
      } else {
        // msg [{id:, when:, freq:}, ...]
        var found = false;
        for (var it = 0; it < msg.length; ++it) {
          if (msg[it].id == id) {
            found = true;
            player.tick(msg[it].when, msg[it].freq,
                BEEP_LENGTH_MS / 1000);
          }
        }
        if (!found) {
          shout("i was killed :(");
        }
      }
    });
  };
};
