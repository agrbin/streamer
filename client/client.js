function Client(ws) {
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
      mysend(ws, msg);
    });
  };
};
