var clock = require('./clock.js')
  , config = require('./config.js').router
  ;

exports.Router = function() {
  var masterSock = null,
      socks = [], ids = [],
      nextClientId = 'A';

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

  this.newMaster = function(sock) {
    console.log("new master request");
    masterSock = sock;
    masterSock.send({n:socks.length,ids:ids});
    masterSock.recv(function (msg) {
      var clientSock;
      for (clientSockIndex in socks) {
        socks[clientSockIndex].send(msg); 
      }
    });
  };

};
