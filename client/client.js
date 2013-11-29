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
      // msg { id: {when:, freq:}, ... }
      player.tick(msg[id].when,  msg[id].freq, 0.3);
    });
  };
};
