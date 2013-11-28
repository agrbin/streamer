var Tap = function() {
  var player = null;
  var freq = 2000;

  this.onTouch = function() {
    try {
      if (player === null) {
        player = new Player(myClock.clock, null,
            document.getElementsByTagName("body")[0]);
      } else {
        player.tick(freq, 0.1);
      }
    } catch (e) {
      alert(e);
    }
  };
};

window.addEventListener('load', function() {
  var tap = new Tap();
  document.addEventListener('click', tap.onTouch, false);
  document.addEventListener('touchstart', tap.onTouch, false);
}, false);

