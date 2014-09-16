function Gui() {
  var h1 = document.getElementById("h1"),
    that = this,
    currentStatus = '';

  this.status = function (msg) {
    h1.innerHTML = currentStatus = msg;
  };

  this.append = function (a) {
    that.status(currentStatus + a);
  };

  this.color = function (color) {
    h1.style.color = color;
  };

  this.fatal = function (msg) {
    that.color('red');
    console.log("error: ", msg);
    that.status(msg);
  };

  this.background = function (color) {
    document.getElementsByTagName('body')[0].style.backgroundColor = color;
  };

  this.log = function (msg) {
    console.log(msg);
  };

  this.getId = function () {
    if (document.location.hash.substr(0, 2) === '#n') {
      return document.location.hash.substr(2);
    }
  };
}

