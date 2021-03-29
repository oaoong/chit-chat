// server.js

var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
var whoIsOn = [];

app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("chat");
});

var count = 1;
io.on("connection", function (socket) {
  // 채팅방에 접속했을 때 - 1
  console.log("user connected: ", socket.id);
  var name = "익명" + count++;
  socket.name = name;
  io.to(socket.id).emit("create name", name);
  whoIsOn.push(name);
  io.emit("new_connect", name, whoIsOn);
  console.log(whoIsOn);

  socket.on("disconnect", function () {
    // 채팅방 접속이 끊어졌을 때 - 2
    console.log("user disconnected: " + socket.id + " " + socket.name);
    whoIsOn.splice(whoIsOn.indexOf(socket.name), 1);
    io.emit("new_disconnect", socket.name, whoIsOn);
    console.log(whoIsOn);
  });

  socket.on("send message", function (name, text) {
    // 메세지를 보냈을 때 - 3
    var msg = name + " : " + text;
    if (name != socket.name)
      // 닉네임을 바꿨을 때
      io.emit("change name", socket.name, name);
    socket.name = name;
    console.log(msg);
    io.emit("receive message", msg);
  });
});

http.listen(3000, function () {
  console.log("server on..");
});
