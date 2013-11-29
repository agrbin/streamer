function Master(ws) {
  // time for the first client to make a sound
  // after master sends request.
  var OFFSET = 2000;
  var FREQ = 1800;

  mysend(ws, ["master"]);
  log("master inited");

  myrecv(ws, function(room) {
    var ids = room.ids;
    log(ids.length);

    var request = {}, now = myClock.clock();
    for (var j = 0; j < ids.length; ++j) {
      var id = ids[j];
      request[id] = {
        when: now + OFFSET + j * 1000,
        freq: FREQ
      };
    }
    mysend(ws, request);
  });

}
