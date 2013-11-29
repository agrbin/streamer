function Master(ws, listener) {
  // time for the first client to make a sound
  // after master sends request.
  var OFFSET = 1000;
  var INTERVAL = 1000;
  var FREQ = 18000;
  var BORDER_LINE = 10;
  listener.setFrequency(FREQ);

  mysend(ws, ["master"]);
  log("master inited");

  var n = 0, offsets = {}, penalties = {}, request;

  function init(room) {
    var names = [];
    for (var id in room.ids) {
      ++n;
      offsets[id] = 0;
      penalties[id] = 0;
      names.push(id);
    }
    log("room has " + n + " clients. " + names.join(", "));
  }

  function buildRequest() {
    var _request = {}, now = myClock.clock();
    for (var id in offsets) {
      _request[id] = {
        whenPretend : now + OFFSET,
        when: now + OFFSET + offsets[id],
        freq: FREQ,
      };
      now += INTERVAL;
    }
    request = JSON.parse(JSON.stringify(_request));
  }

  function handleBeep() {
    var t = myClock.clock();
    var minDist = 100000, whichOne = null;
    for (var id in offsets) {
      var dist = Math.abs(request[id].when - t);
      if (dist < minDist) {
        minDist = dist;
        whichOne = id;
      }
    }
    // log("i heard you, " + whichOne);
    if (whichOne) {
      request[whichOne].heard = t;
    }
  }

  function analyzeResults() {
    listener.stop();
    var ready = true, haveHeard = false;
    for (var id in request) {
      if ('heard' in request[id]) {
        haveHeard = true;
        var delta = request[id].heard - request[id].whenPretend;
        if (Math.abs(delta) > INTERVAL) {
          log(id + " is outlying");
        } else {
          if (Math.abs(delta) > BORDER_LINE) {
            ready = false;
          }
          log(id + " has latency " + delta);
          offsets[id] -= delta / 2;
        }
        penalties[id] = 0;
      } else {
        penalties[id] ++;
        if (penalties[id] == 2) {
          --n;
          log("kicking out " + id);
          mysend(ws, {special:"kill",id:id});
          delete offsets[id];
          delete penalties[id];
        }
      }
    }
    if (!(ready && haveHeard)) {
      doEverything();
    } else {
      mysend(ws, {offsets:offsets});
      mysend(ws, {special:"play"});
    }
  }

  function doEverything() {
    buildRequest();
    listener.onBeep(handleBeep, INTERVAL / 2);
    mysend(ws, request);
    setTimeout(analyzeResults, 2 * OFFSET + n * INTERVAL);
  }

  myrecv(ws, function(room) {
    init(room);
    doEverything();
  });

}
