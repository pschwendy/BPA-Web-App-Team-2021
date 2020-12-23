var express = require("express");
var app = express();
var server = require("http").Server(app);

//you never know when it might come in handy :)
var io = require("socket.io");


app.use(express.static("/static-files"));


app.get("/", function(req, res){

  //replace directory with actual value of client file
  res.sendFile('reservation.html');

});


app.post("/something", function(req, res){


  //handle forms in these thingies

});





server.listen(5432, function(){
  console.log("listening on port 5430");
})
