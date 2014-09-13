function SockWrapper(sock, onFatal) {

  var that = this,
    messageCallbacks = {},
    closeCallbacks = [],
    errorCallbacks = {};

  this.onClose = function (callback) {
    closeCallbacks.push(callback);
  };

  this.onMessage = function (type, callback) {
    messageCallbacks[type] = callback;
  };

  this.onError = function (code, callback) {
    errorCallbacks[code] = callback;
  };

  this.sendType = function (type, data) {
    console.log('<- ', type, data);
    sock.send(JSON.stringify({
      type : type, data : data
    }));
  };

  sock.onclose = function (e) {
    console.log('socket closed');
    var it;
    for (it = 0; it < closeCallbacks.length; ++it) {
      closeCallbacks[it](e);
    }
  };

  sock.onmessage = function (message) {
    console.log('-> ', message.data);
    var data;
    try {
      data = JSON.parse(message.data);
    } catch (err) {
      return onFatal("received message is not json");
    }
    if (data.hasOwnProperty("error")) {
      var code = data.code;
      if (code === undefined || errorCallbacks[code] === undefined) {
        return onFatal(data.error);
      }
      return errorCallbacks[code](data.error);
    }
    if (data.type === 'non-patient-firewall') {
      return that.sendType('non-patient-firewall', {when: new Date().getTime()});
    }
    if (!messageCallbacks.hasOwnProperty(data.type)) {
      return console.log(
        "type '" + data.type + "' not registered.", data.data
      );
    }
    messageCallbacks[data.type](data.data);
  };

};
