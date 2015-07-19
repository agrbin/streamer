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

  beepRepeatedlyIntervalMs : 2000,

  detectorSampleRate : 20,
  detectorRetain : 100,
};

