var express = require("express");
var app = express();

var server = require("http").Server(app);
var path = require('path');

var io = require("socket.io")(server);
var formidable = require("formidable");

var queries = require("./queries.js");
var querier = new queries();

const bcrypt = require("bcryptjs");

//storing tasks as json for now, change to db at some point
var tasks = [];
var restaurantPage;
// establishes socket on connection
io.on("connection", function(socket) {
  // return tasks for itinerary
  socket.on("getTaskData", function(msg) {
    //!query database for all tasks here and send them; using JSON for now
    var allTasks;
    var userId;

    querier.getUserId(msg, function(result){

      userId = result;
      querier.getTasks(userId, function(results){

        allTasks = results;
        socket.emit("getTaskData", allTasks);

      });


    });
   
   
    
  });

  // pushes task to list
  socket.on("addTask", function(msg) {
    //tasks.push({"user": msg[2], "time": msg[1], "task": msg[0], "date": msg[3]});
    let task = msg[0];
    task = task.replace(/ /g, "-");
    console.log("This is the task: " + task);
    var time = msg[1];
    let date = msg[3];
    let quantity = msg[4];
    var userId;
    var waitTime;
    var attractionWaitTime;

    var conflicts = 0;

    //querier.

    console.log("NEWWWWWWW");

    console.log("WORKING");
    console.log(task);
    querier.getUserId(msg[2], function(result){
      userId = result;
      querier.getWaitTime(task, function(result){
        console.log("!!!!!!!!!!!!RESULT!!!!!!!!!!!!!!");
        console.log(result);
        console.log("!!!!!!!!!!!!RESULT!!!!!!!!!!!!!!");
        if (result != "fail" && result != [] && result.length != 0){

        
        waitTime = result[0].average_wait_time;
 
        console.log(waitTime);
        

        var stdDate = date + "T" + time + "Z"
        time = new Date(stdDate) - 0;
        var actual = new Date(stdDate) - (60000 * waitTime);
        //console.log(new Date((date + "T" + time + "Z")));

        
        console.log("GETTING CONFLICTS");
        querier.getConflicts(task, date, time, actual, function(result){
          for(row of result) {
            if (conflicts != "DONZO"){
              conflicts += row.numPeople;
            }
            if (row.user == userId){
              conflicts = "DONZO";
              break;
            }
          }
          console.log("THE RESULT: " + conflicts);

          if (conflicts == "DONZO"){
            socket.emit("addTask_res", "selfConflict")
          }
          if (conflicts + quantity < 50){
            querier.reserve(task, userId, quantity, time, date);
            socket.emit("addTask_res", true);
          }
          else{
            socket.emit("addTask_res", "otherConflict");
          }
  



        });
          
        }
        else{
          querier.reserve(task, userId, 0, time, date);
        }
        

        


      });
    });
    

    //querier.reserve()
  });


  socket.on("getAdminStuff", function(msg){


    querier.validate(msg, function(result){

      if (result){
        querier.addAttraction()        
      }
      else{



      }

    });



  });

  // deletes task from itinerary
  socket.on("deleteTask", function(msg) {

    var user = msg[0];
    var time = msg[1];
    var date = msg[2];
    var task = msg[3];

    /*for (var i = 0; i < tasks.length; i++){
      if (tasks[i].user == msg[0] && tasks[i].time == msg[1] && tasks[i].date == msg[2]){
        tasks.splice(i, 1);
      }
    }*/
    var userId;
    querier.getUserId(user, function(result){
      userId = result;
      querier.delete_reservation(task, userId, time, date);
    });

  });

  // returns on requested attractions for * portal page *
  socket.on("getAttractions", function(msg) {
    querier.getAttractions(msg, function(data) {
      socket.emit("receiveAttractions", data, msg);
    });
    //socket.emit("receiveAttractions", restaurantData);
  });

  socket.on("getAdData", function(page) {
    console.log(page);
    querier.getAttractions(true, function(data) {
      for(i = 0; i < data.length; i++) {
        if(data[i].page_address == page) {
          console.log("in this " + page);
          socket.emit("receiveAdData", data[i]);
          //console.log("done!");
          break;
        }
      }
    });
  });

  socket.on("getAdData", function(page, restaurants) {
    querier.getAttractions(restaurants, function(data) {
      for(i = 0; i < data.length; i++) {
        if(data[i].page_address == page) {
          console.log("in this " + page);
          socket.emit("receiveAdData", data[i]);
          //console.log("done!");
          querier.getAverageRating(data[i].id, function(averageRating) {
            socket.emit("loadRating", averageRating);
          });
          break;
        }
      }
    });
  });

  socket.on("getMenu", function(id, hover) {
    querier.getMenu(id, (data) => {
      socket.emit("receiveMenu", data, hover);
    });
    //socket.emit("receiveAttractions", restaurantData);
  });

  socket.on("getCookies", function(msg){
    var cookie = socket.handshake.headers.cookie;
    console.log("COOKIE: " + cookie);
  });

  socket.on("submitRating", function(restaurantID, userID, rating){
    querier.addRating(restaurantID, userID, rating, function() {
      querier.getAverageRating(restaurantID, function(averageRating) {
        socket.emit("loadRating", averageRating);
      });
    });
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
  res.cookie("name", "__");
  res.cookie("nick", "bobby");
  res.cookie("id", 2);

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
app.get("/:whatever?/:whateverTwo?/logout", function(req, res) {
  console.log(req.path);
  res.clearCookie("ERROR");
  res.clearCookie("name");
  res.clearCookie("nick");
  if (req.params.whatever != undefined){
    if (req.params.whateverTwo != undefined){
      res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
    }
    else{
      res.redirect("/" + req.params.whatever);
    }

  }
  else{
    res.redirect('/');
  }
}); /* logout */

// login
// input: req -> http request
// input: res -> app response

/*app.post("/:whatever/login", function(req, res){
  res.redirect("login");
})
app.get("/:whatever/logout", function(req, res){
  res.redirect("logout");
});
app.post("/:whatever/signup", function(req, res){
  res.redirect("signup");
});
app.post("/:whatever/gsignin", function(req, res){
  res.redirect("gsignin");
});*/

app.post("/:whatever?/:whateverTwo?/login", function(req, res) {
  //should also validate log in once database is ready
  //for now, it just creates a cookie based on the username
  console.log(req.path);
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    //cleanse useer of previous errors
    res.clearCookie("ERROR");
    res.clearCookie("name");

    var username = fields.uname;
    var password = fields.pwd;

    console.log(username);
    console.log(password);

    querier.login(username, password, function(result) {
      if (result != false) {
        console.log("SUPPOSED COOKIE:" + result.email);
        res.cookie("name", result.email);
        res.cookie("nick", result.nickname);
        res.cookie("id", result.id);
        if (req.params.whatever != undefined){
          if (req.params.whateverTwo != undefined){
            res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
          }
          else{
            res.redirect("/" + req.params.whatever);
          }

        }
        else{
          res.redirect('/');
        }
      } else {
        res.cookie("ERROR", 4);
        if (req.params.whatever != undefined){
          if (req.params.whateverTwo != undefined){
            res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
          }
          else{
            res.redirect("/" + req.params.whatever);
          }

        }
        else{
          res.redirect('/');
        }
      }
    });
  });
}); /* login */

// checkPassword
// input: password -> password being checked
function checkPassword(password, rePass) {
  //do all the length, characters, numbers stuff here
  var charGex = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/;
  var digitGex = /\d/;
  console.log("CHAR RESULTS:::::::::");
  console.log(charGex);
  console.log(digitGex);
  if (password.length >= 7 && password == rePass){
    return true;
  }
  else{
    return true;
  }
} /* checkPassword */

// checkEmail
// input: email -> email being checked
function checkEmail(email) {
  //check if email is actually an email
  var regex = /\S+@\S+\.\S+/;
  return regex.test(email);
} /* checkEmail */

// signup
// input: req -> http request
// input: res -> app response
app.post("/:whatever?/:whateverTwo?/signup", function(req, res) {
  console.log(req.path);
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    //cleanse user of lingering mishap cookie
    res.clearCookie("ERROR");

    var email = fields.email;
    var password = fields.pwd;
    var nickname = fields.nickname;
    var rePass = fields.repeatPwd;

    var emailWorks = checkEmail(email);
    var pwdWorks = checkPassword(password, rePass);
    var dataWorks = false;

    //salt and hash password with ten rounds of salting
    bcrypt.hash(password, 10, function(err, hash){
      console.log(password + " => " + hash);
      password = hash;

      querier.signup(email, password, nickname, function(result){
        dataWorks = result;
        //console.log(dataWorks);

        if (emailWorks && pwdWorks && (dataWorks== true)) {
          console.log("HI");
          res.cookie("name", email);
          res.cookie("nick", nickname);
        }

        if (!emailWorks) {
          res.cookie("ERROR", 1)
        } else if (!pwdWorks) {
          res.cookie("ERROR", 2)
        } else if (!dataWorks) {
          res.cookie("ERROR", 3)
        }

        if (req.params.whatever != undefined){
          if (req.params.whateverTwo != undefined){
            res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
          }
          else{
            res.redirect("/" + req.params.whatever);
          }

        }
        else{
          res.redirect('/');
        }

      });
    });
  });
}); /* signup */

app.post("/:whatever?/:whateverTwo?/gsignin", function(req, res){

  //console.log("RECEIVED SOMETHING");
  console.log(req.path);
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){

    //cleanse user of lingering mishap cookie
    res.clearCookie("ERROR");

    var email = fields.gName;
    var password = fields.gPwd;
    var nickname = fields.gNick;

    var oldPassword = fields.gPwd;

    console.log(email +" " + password + " " + nickname);


    var emailWorks = true;
    var pwdWorks = true;
    var dataWorks = false;

    //salt and hash password with ten rounds of salting
    bcrypt.hash(password, 10, function(err, hash){

      password = hash;

      querier.signup(email, password, nickname, function(result){

        dataWorks = result;
        console.log(dataWorks);

        if (emailWorks && pwdWorks && (dataWorks== true)){
          console.log("HI");
          res.cookie("name", email);
          res.cookie("nick", nickname);
          if (req.params.whatever != undefined){
            if (req.params.whateverTwo != undefined){
              res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
            }
            else{
              res.redirect("/" + req.params.whatever);
            }

          }
          else{
            res.redirect('/');
          }
        }
        else{
          if (!emailWorks){
            res.cookie("ERROR", 1);
            if (req.params.whatever != undefined){
              if (req.params.whateverTwo != undefined){
                res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
              }
              else{
                res.redirect("/" + req.params.whatever);
              }

            }
            else{
              res.redirect('/');
            }
          }
          else if (!pwdWorks){
            res.cookie("ERROR", 2);
            if (req.params.whatever != undefined){
              if (req.params.whateverTwo != undefined){
                res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
              }
              else{
                res.redirect("/" + req.params.whatever);
              }

            }
            else{
              res.redirect('/');
            }
          }
          else if (!dataWorks){
            querier.login(email, oldPassword, function(result){

              if (result != false){
                res.cookie("name", email);
                res.cookie("nick", nickname);
              }
              else{
                res.cookie("ERROR", 4);
              }

              if (req.params.whatever != undefined){
                if (req.params.whateverTwo != undefined){
                  res.redirect("/" + req.params.whatever + "/" + req.params.whateverTwo);
                }
                else{
                  res.redirect("/" + req.params.whatever);
                }

              }
              else{
                res.redirect('/');
              }


            });
          }

        }

      });


    });



  });

});










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

// admin
// input: req -> http request
// input: res -> app response
app.get("/admin", function(req,res) {
  res.sendFile(__dirname + "/admin.html");
}); /* admin */

// reservation
// input: req -> http request
// input: res -> app response
app.get("/restaurants/:restaurantPage", function(req, res) {
  res.sendFile(__dirname + "/reservation.html");
  
	//io.on("connection", function(socket) {
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
    
	//});
}); /* reservation */

// wtfudge...
app.get("/itenerary.js", function(req,res) {
  res.sendFile(__dirname + "/itenerary.js");
}); /* wtfudge... */

app.get("/:place", function(req, res) {
  //replace directory with actual value of client file
  res.clearCookie("ERROR");
  res.sendFile(__dirname + "/static-files/" + req.params.place);
});

// listen to server port
var port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log("listening on port 3000");
});


function clearOldReservations(){


  var upperBound = new Date();
  var lowerBound = upperBound - (60000 * 2);
  


}

//clearOldReservations();
