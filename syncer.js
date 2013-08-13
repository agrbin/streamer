/*
 * Syncer will send first message to initiate sync process with server and on
 * every recieved empty message it will answer with current local time.
 *
 * Upon reception of non-empty message, Syncer will parse it as a Number which
 * will be used as offset for clock shifting. done() will be invoked
 * afterwards.
 */
var Syncer = function(ws, done) {
  ws.onmessage = function(buf) {
    if (buf.data.length == 0) {
      ws.send(myClock.clock().toString());
    } else {
      myClock.skew(Number(buf.data));
      done();
    }
  };
  // initiate sync
  ws.send("-1");
};
