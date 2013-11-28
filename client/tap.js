var Tap = function() {
  player = null; canvas = null;
  var freq = 18000;

  this.onTouch = function() {
    if (canvas === null) {
    }
    if (player === null) {
      player = new Player(myClock.clock, null,
          document.getElementsByTagName("body")[0]);
    } else {
      player.tick(freq, 0.3);
    }
  };
};

window.addEventListener('load', function() {
  var tap = new Tap();
  document.addEventListener('click', tap.onTouch, false);
  document.addEventListener('touchstart', tap.onTouch, false);
}, false);



