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

var _body = null;
var _color = "red";
function clockit() {
  if (_body === null) _body = document.body;
  _color = (_color == "red" ? "blue" : "red");
  _body.style.backgroundColor = _color;
  var t = myClock.clock();
  setTimeout(clockit, 1000 - (t % 1000));
}

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
