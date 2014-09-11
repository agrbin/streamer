var config = require('./config.js').server,
  SockWrapper = require('./sockwrap.js').SockWrapper,
  Streamer = require('./streamer.js').Streamer,
  Sonic = require('./sonic.js').Sonic,
  sonic = new Sonic(),
  streamer;

var streamer = new Streamer(function (chunk) {
  // get components from sonic syncer.
  // iterate over all components and send chunk to all clients
  // listed.
  var components = sonic.getComponents(),
    component,
    it,
    sock,
    client,
    sent = false;
  for (it = 0; it < components.length; ++it) {
    component = components[it];
    for (client in component) {
      if (component.hasOwnProperty(client)) {
        sock = sonic.getSocket(client);
        sonic.clientIsPlaying(client);
        if (sock) {
          sock.sendType('chunk', {
            url : chunk.url,
            start : chunk.start
              - sonic.getClockDelta(client)
              - component[client],
            component : component
          });
          sent = true;
        }
      }
    }
  }
  return sent;
});

(function () {
  var ws = require('ws'),
    httpServer = require('http').createServer(),
    server = new ws.Server({server: httpServer});

  server.on('connection', function(sock) {
    sonic.newClient(new SockWrapper(sock));
  });

  httpServer.listen(config.port);
}());

