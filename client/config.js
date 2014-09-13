var config = {
  server : 'wss://agrbin-streamer.herokuapp.com/',

  /* ms */
  beepDuration : 30,

  /* after one beep is detected, next beep can be detected after this
   * period of time*/
  beepSpacing : 500,

  /* Hz */
  beepFreq : 13e3,

  /* Hz */
  noiseFreqLow : 10e3,
  noiseFreqHigh : 12e3,

  /* ms, how often to take noise snapshot */
  noiseSnapshotInterval : 3e4,

  /* number of noise samples to collect */
  noiseSamples : 100,

  /* test sync with beeping */
  testBeepFreq : false,

};

