// server and client have synced clocks. if chunk is to be played less than
// sendAhead seconds in the future, dispatch process for that chunk will begin.
// every setTimeout-ed 0.5 seconds streamer will check above condition.
//
// overlapTime
//  is overlapping between chunks to make seamless playback on
//  client. this constant is copied to ../client/player.js
//
// chunkDuration
//  is chunk duration! it is copied to lib/frames.cpp
//
exports.streamer = {
  sendAhead     : 4,
  checkInterval : 0.5,
  chunkDuration : 2.448,
  overlapTime   : 0.048,
  chunkHostUrl  : process.env.DEV ? "frags/" :
                                    "//agrbin.github.io/streamer/frags/",
  numberOfChunks: 57
};

// synchronization params.
exports.sync = {
  NumberOfSamples : 10,
  MaxClockDeviation : 10
};

exports.sonic = {
  roundRobinInterval : 2000,
  recordsQueue : 30,
  recordsInliersRatio : 0.6,
  buildGraph : 3000,
  ignoreSelfHear : false,
  minReports : 3,
  maxDevInComponent : 10,
};

exports.socket = {
  // ping will be sent  every pingInterval seconds to client
  // to keep the connection alive across non patient firewalls.
  pingInterval : 60,

  // this will turn of clock skew checks and sleepyPeriod checks
  ignoreNetworkProblems : false,

  // if socket notices sleepyPeriod seconds without user activity, that user
  // will get disconnected.
  sleepyPeriod : 30 * 60,

  // maximum ping
  maxPing : 500,
};

