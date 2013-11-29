function Client(ws, player) {
  var id = null;
  mysend(ws, ["client", navigator.userAgent]);

  myrecv(ws, function(msg) {
    id = msg;
    shout("client " + id);
    log("client " + id + " inited");
    beClient();
  });

  function beClient() {
    myrecv(ws, function(msg) {
      if ('play' in msg) {
        shout("I plays!");
        return;
      }
      if ('url' in msg) {
        player.addChunk(msg);
      } else {
        // msg { id: {when:, freq:}, ... }
        player.tick(msg[id].when,  msg[id].freq, 0.1);
      }
    });
  };
};
