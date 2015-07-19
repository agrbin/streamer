//
// screenshotaj tocke 
//
// malo refactor sve ostalo.
// vrati spectrum
//
var config = {
  server : 'wss://agrbin-streamer.herokuapp.com/',

  /* ms */
  beepDuration : 300,

  /* hz */
  beepFreqLow :  2000,
  beepFreqHigh : 5000,

  /* test sync with beeping */
  testBeepFreq : false,

  // In Beeper::beepRepeatedly, what's the bepp interval?
  beepRepeatedlyIntervalMs : 1000,

  // In Beeper::beepRepeatedly, how many beeps to send?
  maxBeepRepeatedlyBeeps : -1,

  detectorSampleRate : 20,
  detectorRetain : 100,
};

