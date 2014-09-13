/*
 * this clock takes time always from audioContext and returns it's value
 * multiplied by 1000 and rounded.
 */
function Clock(audioContext) {

  this.clock = function () {
    return Math.round(audioContext.currentTime * 1000);
  };

}

