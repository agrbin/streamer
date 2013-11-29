function Master(ws, listener) {
  // time for the first client to make a sound
  // after master sends request.
  var OFFSET = 2000;
  var INTERVAL = 2000;
  var FREQ = 18000;
  listener.setFrequency(FREQ);

  mysend(ws, ["master"]);
  log("master inited");

  myrecv(ws, function(room) {
    var ids = room.ids;
    log(ids.length);

    var request = {}, now = myClock.clock();
    for (var j = 0; j < ids.length; ++j) {
      var id = ids[j];
      request[id] = {
        when: now + OFFSET + j * INTERVAL,
        freq: FREQ,
      };
    }

    listener.onBeep(function () {
      var t = myClock.clock();
      var minDist = 100000, whichOne = null;
      for (var j = 0; j < ids.length; ++j) {
        var dist = Math.abs(request[ids[j]].when - t);
        if (dist < minDist) {
          minDist = dist;
          whichOne = ids[j];
        }
      }
      log("i heard you, " + whichOne);
      request[whichOne].heard = t;
    }, INTERVAL / 2);

    setTimeout(function() {
      log("done listening");
      analyzeResults();
      listener.stop();
    }, 2 * OFFSET + ids.length * INTERVAL);

    function analyzeResults() {
      for (var id in request) {
        log(id + " has latency " + (request[id].heard - request[id].when));
      }
    }

    mysend(ws, request);
  });

}
