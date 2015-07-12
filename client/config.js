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
  beepFreqLow :  10000,
  beepFreqHigh : 14000,

  /* test sync with beeping */
  testBeepFreq : false,

  beepRepeatedlyIntervalMs : 2000,

  anomalySampleInterval : 15,

  /* to trigger beep detection clasificator sums this many samples in frequency
   * range and creates one sample of that. if sound of that one sample is
   * greater than usual, beep detection is triggered.
   */
  analyzeTriggerEnergySamples : 10,

  detectorSampleRate : 20,
  detectorRetain : 100,

  anomalySampleInterval : 15,

  /* to trigger beep detection clasificator sums this many samples in frequency
   * range and creates one sample of that. if sound of that one sample is
   * greater than usual, beep detection is triggered.
   */
  analyzeTriggerEnergySamples : 10,

  detectorSampleRate : 20,
  detectorRetain : 100,
};

