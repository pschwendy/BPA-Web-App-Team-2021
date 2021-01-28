var express = require("express");
var app = express();

var server = require("http").Server(app);
var path = require('path');

var io = require("socket.io")(server);
var formidable = require("formidable");

var queries = require("./queries.js");
var querier = new queries();

const bcrypt = require("bcrypt");

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

//storing tasks as json for now, change to db at some point
var tasks = [];

// establishes socket on connection
io.on("connection", function(socket) {
  // return tasks for itinerary
  socket.on("getTaskData", function(msg) {
    //!query database for all tasks here and send them; using JSON for now
    var allTasks = [];

    for (task of tasks) {
      if (task.user == msg) {
        allTasks.push(task);
      }
    }

    console.log(allTasks);
    socket.emit("getTaskData", allTasks);
  });

  // pushes task to list
  socket.on("addTask", function(msg) {
    tasks.push({"user": msg[2], "time": msg[1], "task": msg[0], "date": msg[3]});
    console.log(msg);
  });

  // deletes task from itinerary
  socket.on("deleteTask", function(msg) {
    for (var i = 0; i < tasks.length; i++){
      if (tasks[i].user == msg[0] && tasks[i].time == msg[1] && tasks[i].date == msg[2]){
        tasks.splice(i, 1);
      }
    }
  });

  // returns on requested attractions for * portal page *
  socket.on("getAttractions", function(msg) {
    socket.emit("receiveAttractions", restaurantData);
  });
})

// cookies!
var cookieParser = require("cookie-parser");
app.use(cookieParser());

// access static files
app.use(express.static("static-files"));
app.use('/restaurants', express.static(path.join(__dirname, 'static-files')));
app.use('/rides', express.static(path.join(__dirname, 'static-files')));

// homepage
// input: req -> http request
// input: res -> app response
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
}); /* hompage */

// dk what this is
// input: req -> http request
// input: res -> app response
app.get("/d/socket.io", function(req, res) {
  res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.js");
}); /* dk what this is */

// logout
// input: req -> http request
// input: res -> app response
app.get("/logout", function(req, res) {
  res.clearCookie("name").sendFile(__dirname + "/index.html");
}); /* logout */

// login
// input: req -> http request
// input: res -> app response
app.post("/login", function(req, res) {
  //should also validate log in once database is ready
  //for now, it just creates a cookie based on the username
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    //cleanse useer of previous errors
    res.clearCookie("ERROR");

    var username = fields.uname;
    var password = fields.pwd;

    console.log(username);
    console.log(password);

    querier.login(username, password, function(result) {
      if (result == true) {
        res.cookie("name", username).sendFile(__dirname + "/index.html");
      } else {
        res.cookie("ERROR", 4).sendFile(__dirname + "/index.html");
      }
    });
  });
}); /* login */

// checkPassword
// input: password -> password being checked
function checkPassword(password) {
  //do all the length, characters, numbers stuff here
  return true;
} /* checkPassword */

// checkEmail
// input: email -> email being checked
function checkEmail(email) {
  //check if email is actually an email
  return true;
} /* checkEmail */

// signup
// input: req -> http request
// input: res -> app response
app.post("/signup", function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    //cleanse user of lingering mishap cookie
    res.clearCookie("ERROR");

    var email = fields.email;
    var password = fields.pwd;
    var nickname = fields.nickname;

    var emailWorks = checkEmail(email);
    var pwdWorks = checkPassword(password);
    var dataWorks = false;

    //salt and hash password with ten rounds of salting
    bcrypt.hash(password, 10, function(err, hash){
      console.log(password + " => " + hash);
      password = hash;

      querier.signup(email, password, nickname, function(result){
        dataWorks = result;
        console.log(dataWorks);

        if (emailWorks && pwdWorks && (dataWorks== true)) {
          console.log("HI");
          res.cookie("name", email).sendFile(__dirname + "/index.html");
          return;
        }

        if (!emailWorks) {
          res.cookie("ERROR", 1).sendFile(__dirname + "/index.html");
        } else if (!pwdWorks) {
          res.cookie("ERROR", 2).sendFile(__dirname + "/index.html");
        } else if (!dataWorks) {
          res.cookie("ERROR", 3).sendFile(__dirname + "/index.html");
        }

      });
    });
  });
}); /* signup */


// for my own testing purposes
// itinerary
// input: req -> http request
// input: res -> app response
app.get("/itinerary", function(req,res){
  res.sendFile(__dirname + "/Itinerary.html");
}); /* itinerary */

// restaurants
// input: req -> http request
// input: res -> app response
app.get("/restaurants", function(req,res) {
  res.sendFile(__dirname + "/portal.html");
}); /* restaurants */

app.get("/rides", function(req, res){

  res.sendFile(__dirname + "/rides.html");

}); 


// reservation
// input: req -> http request
// input: res -> app response
app.get("/restaurants/:restaurantPage", function(req, res) {
	res.sendFile(__dirname + "/reservation.html");
	io.on("connection", function(socket) {
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
}); /* reservation */

// wtfudge...
app.get("/itenerary.js", function(req,res) {
  res.sendFile(__dirname + "/itenerary.js");
}); /* wtfudge... */

app.get("/:place", function(req, res) {
  //replace directory with actual value of client file
  res.sendFile(__dirname + "/static-files/" + req.params.place);
});

// listen to server port
server.listen(3000, function() {
  console.log("listening on port 3000");
})
