/*jslint indent: 2, plusplus: true*/
"use strict";

var ws = require('ws'),
  config = require('./config.js').socket,
  clock = require('./clock.js');

exports.SockWrapper = function (sock) {

  var that = this,
    messageCallbacks = {},
    closeCallbacks = [],
    pingTimeout = null,
    stopwatch = new clock.Timer();

  function ping() {
    if (pingTimeout !== null) {
      return that.close("connection lost. dind't answer on ping.");
    }
    that.sendType('non-patient-firewall', null, stopwatch.reset);
    pingTimeout = setTimeout(ping, config.pingInterval * 1000);
    that.onMessageType('non-patient-firewall', function (data) {
      var rtt = stopwatch.get();
      pingTimeout = null;
      if (rtt > config.maxPing) {
        that.close("your ping was too large.");
      }
    });
  }

  this.onMessageType = function (type, callback) {
    messageCallbacks[type] = callback;
  };

  this.onClose = function (callback) {
    closeCallbacks.push(callback);
  };

  this.removeListeners = function () {
    messageCallbacks = {};
    closeCallbacks = [];
  };

  this.sendError = function (error, code, done) {
    try {
      sock.send(JSON.stringify(
        { error: error, code : code }
      ), done);
    } catch (err) {
      if (done) {
        setTimeout(function () {
          done(null, err);
        }, 0);
      }
    }
  };

  this.sendType = function (type, data, done) {
    try {
      sock.send(
        JSON.stringify({type: type, data: data}),
        done
      );
    } catch (err) {
      if (done) {
        setTimeout(function () {
          done(null, err);
        }, 0);
      }
    }
  };

  this.close = function (reason) {
    console.log('close: ' + reason);
    sock.close(1000, reason.substr(0, 100));
  };

  sock.onmessage = function (message) {
    var type, data;
    try {
      data = JSON.parse(message.data);
    } catch (err) {
      that.close("recieved message is not json.");
    }
    for (type in messageCallbacks) {
      if (messageCallbacks.hasOwnProperty(type)) {
        if (type === data.type) {
          messageCallbacks[type](data.data);
        }
      }
    }
  };

  sock.onclose = function () {
    var it;
    for (it = 0; it < closeCallbacks.length; ++it) {
      closeCallbacks[it]();
    }
  };

  (function () {
    setTimeout(ping, config.pingInterval * 1000);
  }());

};
