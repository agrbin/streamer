/*
 * This is clock instance used for synchronization between clients and server.
 */
var myClock = new (function() {

  var offset = 0;

  this.originalClock = function() {
    return (new Date().getTime());
  };

  this.clock = function() {
    return (new Date().getTime() + offset);
  };

  this.skew = function(x) {
    offset += x;
  };

  this.reset = function() {
    myClock.skew(-myClock.clock());
  }

})();

function log() {
  console.log(myClock.clock(), arguments);
}

function shout(msg) {
  document.getElementById("header").innerHTML = msg;
}

function mysend(sock, data) {
  console.log("send: ", data);
  sock.send(JSON.stringify(data));
}

function myrecv(sock, cb) {
  sock.onmessage = function(msg) {
    console.log("recv: ", JSON.parse(msg.data));
    cb(JSON.parse(msg.data));
  }
}
