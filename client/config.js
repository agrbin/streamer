//
// screenshotaj tocke 
//
// malo refactor sve ostalo.
// vrati spectrum
//
var config = {
  server : 'wss://agrbin-streamer.herokuapp.com/',

  /* ms */
  beepDuration : 200,

  /* hz */
  beepFreqLow :  12000,
  beepFreqHigh : 14000,

  /* test sync with beeping */
  testBeepFreq : false,

  anomalySampleInterval : 15,

  /* to trigger beep detection clasificator sums this many samples in frequency
   * range and creates one sample of that. if sound of that one sample is
   * greater than usual, beep detection is triggered.
   */
  analyzeTriggerEnergySamples : 10,

  detectorSampleRate : 20,
  detectorRetain : 100,

};

