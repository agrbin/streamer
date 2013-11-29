function Client(ws, player) {
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
      shout("I plays!");
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
        // msg { id: {when:, freq:}, ... }
        player.tick(msg[id].when,  msg[id].freq, 0.1);
      }
    });
  };
};
