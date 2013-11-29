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
    , chunkToSendPlayTime
    , timerHandler = null;

  // scheduling technique from
  // http://chimera.labs.oreilly.com/books/1234000001552/ch02.html
  // 
  function checkSchedule() {
    if (chunkToSendPlayTime < clock.clock() + sendAhead) {
      sendHandler({
        url   : config.chunkHostUrl + "tg." + chunkToSend + ".mp3",
        start : chunkToSendPlayTime
      });
      chunkToSend = (chunkToSend + 1) % numberOfChunks;
      chunkToSendPlayTime += chunkDuration - overlapTime;
      checkSchedule();
    } else {
      timerHandler = setTimeout(checkSchedule, checkInterval);
    }
  }

  // start song without sending multiple chunks at once
  (function() {
    chunkToSendPlayTime = clock.clock() + sendAhead;
    chunkToSend = 0;
    checkSchedule();
  })();

  this.stop = function() {
    if (timerHandler) {
      clearTimeout(timerHandler);
    }
  };

};
