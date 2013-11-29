var ws = require('ws')
  , Streamer = require('./streamer.js').Streamer
  , Syncer = require('./syncer.js').Syncer
  , Router = require('./router.js').Router
  , JSock = require('./jsock.js').JSock
  , config = require('./config.js').server;

var httpServer = require('http').createServer();
var server = new ws.Server({server: httpServer});
var router = new Router();

server.on('connection', function(sock) {
  new Syncer(sock, function() {
    sock.onmessage = function(msg) {
      try {
        msg = JSON.parse(msg.data);
      } catch (e) {
        return;
      }
      switch (msg[0]) {
        case "client":
          router.addClient(new JSock(sock), msg[1]);
          break;
        case "master":
          router.newMaster(new JSock(sock));
          break;
        default: sock.terminate();
      };
    }
  });
});

/*
// Streamer needs function to send data for all the clients.
new Streamer(function(data) {
  var valid_sockets = [];
  for (var it = 0; it < sockets.length; ++it) {
    var sock = sockets[it];
    if (sock.readyState == ws.OPEN) {
      valid_sockets.push(sock);
      sock.send(JSON.stringify(data), function(err) {
        if (err) sock.terminate(); // no mercy.
      });
    }
  }
  sockets = valid_sockets;
});
*/

httpServer.listen(config.port);
