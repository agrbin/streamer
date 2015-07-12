var WebSocketServer = require("ws").Server;
var http = require("http");
var port = process.env.PORT;
var getGraph = require("./server/graph.js").getGraphHTML;

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(getGraph());
});

server.listen(port);
console.log("http server listening on %d", port);

var wss = new WebSocketServer({server: server});
console.log("websocket server created");

wss.on("connection", require('./server/app.js'));

