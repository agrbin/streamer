var ws = require('ws')
  , Streamer = require('./streamer.js').Streamer
  , Syncer = require('./syncer.js').Syncer
  , config = require('./config.js').server;

var httpServer = require('http').createServer();
var server = new ws.Server({server: httpServer});
var sockets = [];

server.on('connection', function(sock) {
  new Syncer(sock, function() {
    sockets.push(sock);
  });
});

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

httpServer.listen(config.port);
