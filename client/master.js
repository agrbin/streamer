function Master(ws) {
  mysend(ws, ["master"]);
  log("master inited");


  myrecv(ws, function(room) {
    var ids = room.ids;
    log(room.n);

    myrecv(ws, function(){});
    mysend(ws, "hello");
  });

}
