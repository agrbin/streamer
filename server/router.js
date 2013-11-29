var clock = require('./clock.js')
  , config = require('./config.js').router
  , Streamer = require('./streamer.js').Streamer
  , getRandomName = require('./names.js').getRandomName
  ;

exports.Router = function() {
  var masterSock = null,
      clients = {},
      socks = [], ids = [],
      streamer = null;

  this.addClient = function(sock, ua) {
    var myId = getRandomName();
    // register client
    console.log("client " + myId);
    clients[myId] = {
      sock : sock,
      id : myId,
      ua : ua,
    };
    // run client
    sock.send(myId);
    sock.recv(function (msg) {
      masterSock.send([myId, msg]);
    });
  };

  // worked only for A
  function sendHandler(msg) {
    for (var id in clients) {
      clients[id].sock.send(msg);
    }
  }

  function pullIds() {
    var sol = {};
    for (var id in clients)
      sol[id] = id;
    return sol;
  }

  function isSpecialMessage(msg) {
    if (msg instanceof Object && 'special' in msg) {
      return msg.special;
    }
    return false;
  }

  this.newMaster = function(sock) {
    console.log("new master request");
    masterSock = sock;
    if (streamer !== null) {
      streamer.stop();
    }
    masterSock.send({ids:pullIds()});
    masterSock.recv(function (msg) {
      switch (isSpecialMessage(msg)) {
        case "play":
          streamer = new Streamer(sendHandler);
          break;
        case "kill":
          delete clients[msg.id];
          console.log("clinet " + msg.id + " killed");
          break;
        default:
          for (id in clients) {
            clients[id].sock.send(msg);
          }
      }
    });
  };

};
