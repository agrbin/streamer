var WebSocketServer = require("ws").Server;
var http = require("http");
var port = process.env.PORT;
var server = http.createServer(app);

server.listen(port);
console.log("http server listening on %d", port);

var wss = new WebSocketServer({server: server});
console.log("websocket server created");

wss.on("connection", require('./server/app.js'));
