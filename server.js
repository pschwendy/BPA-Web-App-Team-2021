var express = require("express");
var app = express();
var server = require("http").Server(app);

//you never know when it might come in handy :)
var io = require("socket.io")(server);



//keeping it as JSON for now; will be moved to database once that becomes available
var restaurantData = [{

  "name":"Dogs to Go",
  "avgWait":"4 minutes",
  "image":"/dogs-to-go.jpg",
  "description":"Eat some dogs! East some dogs! Eat some dogs!"

}, {

  "name":"Easy As Pie Diner",
  "avgWait":"18 minutes",
  "image":"/easy-as-pie-diner.jpg",
  "description": "Enjoy Gordon Ramsay's signature cuisine in this premium dining experience."

},{

  "name":"Forever Cool Ice Cream",
  "avgWait":"8 minutes",
  "image":"/foreveer-cool-ice-cream.jpg",
  "description":"Enjoy ice cream that is forever cool in a definitely non-ambiguous way."

},{

  "name":"Chickens-R-Us",
  "avgWait":"10 minutes",
  "image":"/chickens-r-us.jpg",
  "description":"CHICKENS ARE US. WE ARE THE CHICKENS."

},{

  "name":"Chuck Wagon",
  "avgWait": "17 minutes",
  "image":"/chuck-wagon.jpg",
  "description":"A classic American diner. If you eat enough, we might even let you ride in Chuck's wagon..."

}];

io.on("connection", function(socket){


  socket.on("getAdData", function(msg){
    socket.emit("getAdData", restaurantData);
  });


});


app.use(express.static("static"));


app.get("/", function(req, res){

  //replace directory with actual value of client file
  res.sendFile(__dirname + "/static/test.html");

});

app.get("/d/socket.io", function(req, res){

  res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.js");

});

app.get("/:place", function(req, res){

  //replace directory with actual value of client file
  res.sendFile(__dirname + "/static/" + req.param.place);

});


app.post("/something", function(req, res){


  //handle forms in these thingies

});



server.listen(5432, function(){
  console.log("listening on port 5430");
})
