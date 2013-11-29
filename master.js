function Master(ws, listener) {
  // time for the first client to make a sound
  // after master sends requests.
  var OFFSET = 1000;
  var INTERVAL = 500;
  var FREQ = 18000;
  var BORDER_LINE = 10;
  var NUM_REQS = 2;
  var CONVERGE_FACTOR = 1.5;

  var lastChunkFromNow = 0;
  listener.setFrequency(FREQ);

  mysend(ws, ["master"]);
  log("master inited");

  var n = 0, offsets = {}, penalties = {}, requests = [];

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
    requests = [];
    var now = myClock.clock();
    for (var id in offsets) {
      for (var j = 0; j < NUM_REQS; ++j) {
        requests.push({
            id: id,
            whenPretend : now + OFFSET,
            when: now + OFFSET + offsets[id],
            freq: FREQ
        });
        now += INTERVAL;
      }
    }
    lastChunkFromNow = INTERVAL + now - myClock.clock();
  }

  function handleBeep() {
    var t = myClock.clock();
    var minDist = 100000, whichOne = null, whichIt = null;
    for (it = 0; it < requests.length; ++it) {
      var dist = Math.abs(requests[it].when - t);
      if (dist < minDist) {
        minDist = dist;
        whichOne = requests[it].id;
        whichIt = it;
      }
    }
    if (whichOne) {
      // log("got you " + whichOne);
      requests[whichIt].heard = t;
    }
  }

  // return must be average without outliers
  function statistics(deltas) {
    return deltas.reduce(function(a,b){return a+b;})
      / deltas.length;
  }

  function killShow(id) {
    var x = document.getElementById(id);
    if (x) {
      x.innerHTML = "";
    }
  }

  function drawShow(id, latency) {
    var node = document.getElementById(id);
    if (!node) {
      node = document.createElement("div");
      node.id = id;
      document.getElementById("show").appendChild(node);
    }
    node.innerHTML = "<b>" + id + "</b> has latency " + latency;
  }

  function analyzeResults() {
    // log("stopped");
    listener.stop();
    var ready = true, haveHeard = false, deltas = {};
    // initialize deltas to 0
    for (var id in offsets) {
      deltas[id] = [];
    }
    // collect deltas
    for (var it = 0; it < requests.length; ++it) {
      var id = requests[it].id;
      if ('heard' in requests[it]) {
        var delta = requests[it].heard - requests[it].whenPretend;
        if (Math.abs(delta) < INTERVAL) {
          deltas[id].push(delta);
        }
      }
    }
    // do penalites and statistics
    var ready = true;
    for (var id in offsets) {
      if (deltas[id].length == 0) {
        --n;
        log("kicking out " + id);
        mysend(ws, {special:"kill",id:id});
        killShow(id);
        delete offsets[id];
        delete penalties[id];
      } else {
        var avg = statistics(deltas[id]);
        log(id + " has " + Math.floor(avg));
        drawShow(id, Math.floor(avg));
        offsets[id] -= avg / CONVERGE_FACTOR;
        if (Math.abs(avg) > BORDER_LINE) {
          ready = false;
        }
      }
    }
    // repeat or call play
    if (ready) {
      mysend(ws, {offsets:offsets});
      header.addEventListener('click', function() {
        mysend(ws, {special:"play"});
        shout("We Plays! ");
      });
      shout("We Play? ");
    } else {
      doEverything();
    }
  }

  function doEverything() {
    buildRequest();
    listener.onBeep(handleBeep, INTERVAL / 2);
    mysend(ws, requests);
    setTimeout(analyzeResults, lastChunkFromNow);
  }

  myrecv(ws, function(room) {
    init(room);
    doEverything();
  });

}
