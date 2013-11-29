exports.JSock = function(sock) {
  this.send = function(msg, cb) {
    sock.send(JSON.stringify(msg), cb);
  };

  this.recv = function(cb) {
    sock.onmessage = function(msg) {
      cb(JSON.parse(msg.data));
    };
  };
};
