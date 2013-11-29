var clock = require('./clock.js')
  , config = require('./config.js').router
  , Streamer = require('./streamer.js').Streamer
  ;

exports.Router = function() {
  var masterSock = null,
      socks = [], ids = [],
      nextClientId = 'A';
  var offsets = null; 

  this.addClient = function(sock, ua) {
    var myId = nextClientId;
    console.log("client " + nextClientId);
    socks.push(sock); ids.push(myId);
    nextClientId = String.fromCharCode(65 + socks.length);
    sock.send(myId);
    sock.recv(function (msg) {
      masterSock.send([myId, msg]);
    });
  };

  function sendHandler(msg) {
    for (clientSockIndex in socks) {
      msg.start += offsets[ids[clientSockIndex]];
      socks[clientSockIndex].send(msg);
    }
  };

  this.newMaster = function(sock) {
    console.log("new master request");
    masterSock = sock;
    masterSock.send({ids:ids});
    masterSock.recv(function (msg) {
      if ('length' in msg && msg.length && msg[0] === "play") {
        offsets = msg[1];
        console.log("i have my offsets ", offsets);
        new Streamer(sendHandler);
      }
      var clientSock;
      for (clientSockIndex in socks) {
        socks[clientSockIndex].send(msg); 
      }
    });
  };

};
