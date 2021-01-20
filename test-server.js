var express = require("express");
var app = express();
var server = require("http").Server(app);
var path = require('path');
//you never know when it might come in handy :)
var io = require("socket.io")(server);
var formidable = require("formidable");

//keeping it as JSON for now; will be moved to database once that becomes available
var restaurantData = [{

  "name":"Dogs to Go",
  "page":"dogs-to-go",
  "avgWait":"4 minutes",
  "image":"/dogs-to-go.jpg",
  "description":"Eat some dogs! East some dogs! Eat some dogs!"

}, {

  "name":"Easy As Pie Diner",
  "page":"easy-as-pie",
  "avgWait":"18 minutes",
  "image":"/easy-as-pie-diner.jpg",
  "description": "Enjoy Gordon Ramsay's signature cuisine in this premium dining experience."

},{

  "name":"Forever Cool Ice Cream",
  "page":"forever-cool-ice-cream",
  "avgWait":"8 minutes",
  "image":"/foreveer-cool-ice-cream.jpg",
  "description":"Enjoy ice cream that is forever cool in a definitely non-ambiguous way."

},{

  "name":"Chickens-R-Us",
  "page":"chickens-r-us",
  "avgWait":"10 minutes",
  "image":"/chickens-r-us.jpg",
  "description":"CHICKENS ARE US. WE ARE THE CHICKENS."

},{

  "name":"Chuck Wagon",
  "page":"chuck-wagon",
  "avgWait": "17 minutes",
  "image":"/chuck-wagon.jpg",
  "description":"A classic American diner. If you eat enough, we might even let you ride in Chuck's wagon..."

}];



var cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.static("static-files"));
app.use('/restaurants', express.static(path.join(__dirname, 'static-files')));

app.get("/", function(req, res){
  //replace directory with actual value of client file
  /*res.sendFile(__dirname + "/reservation.html");
  io.on("connection", function(socket){
	socket.on("getAdData", function(msg){
	  socket.emit("getAdData", restaurantData);
	});
  });*/
  //replace directory with actual value of client file
  res.sendFile(__dirname + "/index.html");
});

app.get("/d/socket.io", function(req, res){
  res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.js");
});

app.post("/login", function(req, res){

  //should also validate log in once database is ready
  //for now, it just creates a cookie based on the username
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){


    var username = fields.uname;
    res.cookie("name", username).send("Sent a cookie!");


  });

});

app.get("/:place", function(req, res){
  //replace directory with actual value of client file
  res.sendFile(__dirname + "/static-files/" + req.param.place);
});



server.listen(5432, function(){
  console.log("listening on port 5432");
})

app.get("/restaurants/:restaurantPage", function(req, res){
	res.sendFile(__dirname + "/reservation.html");
	io.on("connection", function(socket){
    /*socket.on("getAdData", function(){
      console.log("in!");
      for(i = 0; i < restaurantData.length; i++) {
        if(restaurantData[i].page == req.params.restaurantPage) {
          socket.emit("receiveAdData", restaurantData, i);
          console.log("done!");
          break;
        }
      }
    });*/
    for(i = 0; i < restaurantData.length; i++) {
      if(restaurantData[i].page == req.params.restaurantPage) {
        socket.emit("receiveAdData", restaurantData, i);
        console.log("done!");
        break;
      }
    }
	});
});
