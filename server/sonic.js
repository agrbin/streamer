var config = require('./config.js').sonic,
  Graph = require('./graph.js').Graph,
  croatianNames = require('./names.js').names;

module.exports.Sonic = function () {
  var clients = {},
    beepReports = {},
    clockDeltas = {},
    lastGraphBuilt = 0,
    startedPlaying = {},
    lastBeep = {
      to : null,
      when : null,
    },
    graph = new Graph(),
    that = this;

  function info(msg) {
    // console.log("Sonic: Info: "+ msg);
  }

  function log(msg) {
    console.log("Sonic: " + msg);
  }

  function randomId() {
    return croatianNames[Math.floor(Math.random() * croatianNames.length)];
  }

  function clock() {
    return new Date().getTime();
  }

  function processBeep(receiver, from_t) {
    var sender = lastBeep.to;
    if (config.ignoreSelfHear && sender === receiver) {
      return;
    }
    info(receiver + ' heard beep from ' + sender
        + ' delay was ' + (from_t - lastBeep.when));
    if (!beepReports[receiver].hasOwnProperty(sender)) {
      beepReports[receiver][sender] = [];
    }
    beepReports[receiver][sender].push({
      delay : from_t - lastBeep.when
    });
    if (lastGraphBuilt + config.buildGraph < clock()) {
      lastGraphBuilt = clock();
      graph.importBeepReports(beepReports);
      components = graph.getComponents();
    }
  }

  function getOnClose(clientId) {
    return function () {
      log(clientId, 'dead');
      delete beepReports[clientId];
      delete startedPlaying[clientId];
      delete clients[clientId];
    };
  }

  function getOnBeep(clientId) {
    return function (data) {
      if (lastBeep.to && clock() - lastBeep.when < 1000) {
        processBeep(clientId, data);
      } else {
        log(clientId + ' got misleading beep');
      }
    };
  }

  function nextClient(current) {
    var arr = Object.keys(clients),
      n = arr.length,
      next,
      it;
    if (!arr.length) {
      return null;
    }
    for (it = 0; it < n; ++it) {
      if (arr[it] === current) {
        next = (it + 1) % n;
      }
    }
    next = next || 0;
    it = next;
    while (startedPlaying[arr[next]]) {
      next = (next + 1) % n;
      if (next === it) {
        // everybody playing.
        return null;
      }
    }
    return arr[next];
  }

  function sendThisBeep(to) {
    lastBeep.when = clock() + config.roundRobinInterval / 2;
    clients[to].sendType('beep', lastBeep.when - clockDeltas[to]);
    info('beep sent to: ' + to);
  }

  function startRoundRobin() {
    var next = nextClient(lastBeep.to);
    lastBeep.to = next;
    if (next) {
      sendThisBeep(next);
    }
    setTimeout(startRoundRobin, config.roundRobinInterval);
  }

  this.getClockDelta = function (who) {
    return clockDeltas[who];
  };

  this.clientIsPlaying = function (who) {
    startedPlaying[who] = true;
  };

  this.getComponents = function () {
    return graph.getComponents();
  };

  this.getSocket = function (it) {
    return clients[it];
  };

  this.newClient = function (sock) {
    var clientId, initialized = false;

    clientId = randomId();
    sock.sendType('clock', clientId);

    sock.onMessageType('clock', function (data) {
      if (data.clientId) {
        clientId = data.clientId;
      }
      clockDeltas[clientId] = clock() - data.localTime;
      log(clientId + ' connected with clock delta '
          + clockDeltas[clientId]);
      if (!initialized) {
        initialized = true;
        clients[clientId] = sock;
        sock.onClose(getOnClose(clientId));
        beepReports[clientId] = [];
        sock.onMessageType('on_beep', getOnBeep(clientId));
      }
    });
  };

  startRoundRobin();
}

