var clock = require('./clock.js')
  , config = require('./config.js').streamer
  ;

/*
 * Streamer will send stream directions to clients.
 *  sendHandler must dispatch message to all clients
 *  it will loop over fragments defined in config.
 */
exports.Streamer = function(sendHandler) {

  // all clocks here are in milliseconds
  var chunkDuration = config.chunkDuration * 1000
    , sendAhead = config.sendAhead * 1000
    , checkInterval = config.checkInterval * 1000
    , overlapTime = config.overlapTime * 1000
    , numberOfChunks = config.numberOfChunks
    , checkTimer
    , chunkToSend
    , chunkToSendPlayTime;

  // scheduling technique from
  // http://chimera.labs.oreilly.com/books/1234000001552/ch02.html
  // 
  function checkSchedule() {
    var sent;
    if (chunkToSendPlayTime < clock.clock() + sendAhead) {
      sent = sendHandler({
        url   : config.chunkHostUrl + "tg." + chunkToSend + ".mp3",
        start : chunkToSendPlayTime
      });
      chunkToSend = sent ? (chunkToSend + 1) % numberOfChunks : 0;
      chunkToSendPlayTime += chunkDuration - overlapTime;
      checkSchedule();
    } else {
      setTimeout(checkSchedule, checkInterval);
    }
  }

  // start song without sending multiple chunks at once
  (function() {
    chunkToSendPlayTime = clock.clock() + sendAhead;
    chunkToSend = 0;
    checkSchedule();
  })();

};
