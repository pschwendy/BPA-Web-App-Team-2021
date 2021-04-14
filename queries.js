const sqlite3 = require('sqlite3').verbose();
const bcrypt = require("bcryptjs");

class Queries {
    db = new sqlite3.Database('./testdb.db');

    // login function
    // checks if database query @ username has password = input password
    // input: username -> username used for finding user in database
    // input: password -> checks if found user has this password
    login(username, password, callback) {
        let sql = "SELECT password FROM users WHERE username=$username"
        this.db.get(sql, {
            $username: username
        },
        (err, rows) => {
            //console.log(rows);
            // there should not be an error or more than one user found
            if(err) {
                throw(err);
            } else if (!rows) {
              //console.log("HUH");
              return callback(false);
            } else if (rows.length > 1) {
                return callback(false);
            }
            // logins in if password is correct
            bcrypt.compare(password, rows.password, function(err, result){
              //console.log("RES: " + result);
              return callback(rows);
            });
        });
    } /* login */

    // sign up function
    // checks to see if username is already taken and returns false if it is
    // if not -> inserts username and a HASHED password into table and returns true
    // input: username -> username being used to create an account
    // input: password -> password being used to keep account safe
    // input: email -> email of user to receive updates
    // input: callback -> callback function handles rows for asynchronous server
    signup(username, password, email, callback) {
        let sql = "SELECT * FROM users WHERE username=$username";
        var self = this;
        this.db.get(sql, {
            $username: username
        }, (err, rows) => {
            if(err) {
                throw(err);
            } else if(!rows) {
                let insert_statement = "INSERT INTO users(username, password, admin, email) VALUES ($username, $password, $admin, $email)";
                this.db.run(insert_statement, {
                    $username: username,
                    $password: password,
                    $admin: false,
                    $email: email,
                }, (err) => {
                    if(err) {
                        throw(err);
                    }
                });
                // logs in if conditions are met
                //console.log("gave true");
                callback(true);
            } else {
                //console.log(rows);
                callback(false);
            }

        });
    } /* signup */

    // reservation function
    // inserts reservation into reservations table
    // input: attraction -> name of attraction reserved
    // input: account_id -> user id of logged in account
    // input: num_people -> number of people in reservation
    // input: res_time -> time of reservation
    // input: res_date -> date of reservation
    reserve(attraction, account_id, num_people, res_time, res_date) {
        //console.log("NUMBER HERE: " + num_people);
        let sql = "INSERT INTO reservations(attractionRideName, numPeople, time, date, user) VALUES ($attraction, $num_people, $time, $date, $user)";
        this.db.run(sql, {
            $attraction: attraction,
            $num_people: num_people,
            $time: res_time,
            $date: res_date,
            $user: account_id,
        }, (err) => {
            if(err) {
                throw(err);
            }
        });
    } /* reserve */

    // reservation function
    // deletes reservation from reservations table
    // input: attraction -> name of attraction reserved
    // input: account_id -> user id of logged in account
    // input: num_people -> number of people in reservation
    // input: res_time -> time of reservation
    // input: res_date -> date of reservation
    delete_reservation(attraction, account_id, res_time, res_date) {
        let sql = "DELETE FROM reservations WHERE attractionRideName=$attraction AND time=$time AND date=$date AND user=$user";
        this.db.run(sql, {
            $attraction: attraction,
            $time: res_time,
            $date: res_date,
            $user: account_id,
        }, (err) => {
            if(err) {
                throw(err);
            }
        });
        //console.log("*****************RAN DELETE FUNCTION****************");
    } /* delete_reservation */

    // reservation function
    // updates reservation from reservations table
    // input: attraction -> name of attraction reserved
    // input: account_id -> user id of logged in account
    // input: old_num_people -> original number of people in reservation
    // input: old_time -> original time of reservation
    // input: old_date -> original date of reservation
    // input: new_num_people -> updated number of people in reservation
    // input: new_time -> updated time of reservation
    // input: new_date -> updated date of reservation
    update_reservation(account_id, attraction, old_time, old_date, new_attraction, new_time, new_date) {
        let sql = "UPDATE reservations SET attractionRideName=$new_attraction, time=$new_time, date=$new_date WHERE attractionRideName=$attraction AND time=$old_time AND date=$old_date AND user=$user";
        this.db.run(sql, {
            $attraction: attraction,
            $new_attraction: new_attraction,
            $old_time: old_time,
            $old_date: old_date,
            $user: account_id,
            $new_time: new_time,
            $new_date: new_date,
        }, (err) => {
            if(err) {
                throw(err);
            }
        });
    } /* update_reservation */

    // getItinerary function
    // returns list of reservations for an account
    // input: account_id -> user id of logged in account
    // input: callback -> callback function handles rows for asynchronous server
    getItinerary(account_id, callback) {
        let sql = "SELECT * FROM reservations WHERE user=$account_id";
        this.db.all(sql, {
            $user: account_id
        }, (err, rows) => {
            if(err) {
                throw(err);
            }
            return callback(rows);
        });
    } /* getItinerary */


    // getMenu function
    // returns menu at a given restaurant
    // input: restaurantId -> id of attraction for getting menu data
    // input: callback -> callback function handles rows for asynchronous server
    getMenu(restaurantId, callback) {
        let sql = "SELECT * FROM menu WHERE storeNumber=$restaurantId";
        this.db.all(sql, {
            $restaurantId: restaurantId
        }, (err, rows) => {
            if(err) {
                throw(err);
            }
            if(rows.length != 0) {
                return callback(rows);
            }
        });
    } /* getMenu */

    // getRatings
    // returns average rating of a given restaurant
    // input: restaurantId -> id of attraction for getting menu data
    // input: callback -> callback function handles rows for asynchronous server
    getAverageRating(restaurantId, callback) {
        let sql = "SELECT rating FROM ratings WHERE storeNumber=$restaurantId";
        this.db.all(sql, {
            $restaurantId: restaurantId
        }, (err, rows) => {
            if(err) {
                throw(err);
            }
            var sum = 0;
            for (var rating of rows) {
                sum += rating.rating;
            }
            //console.log(rows.length);
            var numRows = rows.length;
            if(numRows == 0) {
                numRows++;
            }
            const averageRating = sum/numRows;
            return callback(averageRating);
        });
    } // getRatings()

    // adds user rating
    addRating(restaurantId, username, rating, callback) {
        if(username == "") {
            return;
        }
        let getUserId = "SELECT * FROM users WHERE username=$username";
        this.db.all(getUserId, {
            $username: username
        }, (err, ids) => {
            if(err) {
                throw(err);
            }
            if(ids.length == 0) {
                return;
            }
            //console.log("THE ID: " + ids[0].id);
            const userID = ids[0].id;
            //console.log("ID: " + userID);
            let select = "SELECT rating FROM ratings WHERE user=$userID AND storeNumber=$restaurantId";
            this.db.all(select, {
                $restaurantId: restaurantId,
                $userID: userID
            }, (err, rows) => {
                if(err) {
                    throw(err);
                }
                //console.log("Does rows == undefined? " + (rows==undefined));
                // if rows are found, update them
                if(rows.length != 0) {
                    let update = "UPDATE ratings SET rating=$rating WHERE user=$userID AND storeNumber=$restaurantId";
                    this.db.all(update, {
                        $restaurantId: restaurantId,
                        $userID: userID,
                        $rating: rating,
                    }, (err) => {
                        if(err) {
                            throw(err);
                        }
                    });
                    return callback(); // exit early
                }

                // if not, insert into table
                let insert = "INSERT INTO ratings (storeNumber, user, rating) VALUES ($restaurantId, $userID, $rating)";
                this.db.run(insert, {
                    $restaurantId: restaurantId,
                    $userID: userID,
                    $rating: rating,
                }, (err) => {
                    if(err) {
                        throw(err);
                    }
                });
            });
        });
        
        return callback();
    } // addRating()
    
    // selects user rating
    selectRating(restaurantId, username, callback) {
        if(username == "") {
            return;
        }
        let getUserId = "SELECT * FROM users WHERE username=$username";
        this.db.all(getUserId, {
            $username: username
        }, (err, ids) => {
            if(err) {
                throw(err);
            }
            if(ids.length == 0) {
                return;
            }
            const userID = ids[0].id;
            //console.log("ID: " + userID);
            let select = "SELECT rating FROM ratings WHERE user=$userID AND storeNumber=$restaurantId";
            this.db.all(select, {
                $restaurantId: restaurantId,
                $userID: userID
            }, (err, rows) => {
                if(err) {
                    throw(err);
                }
                //console.log("FETCHING ROWS:" + rows);
                // if rows are found, update them
                if(rows.length != 0) {
                    return callback(rows[0].rating);
                }
            });
        });
    } // selectRating()

    //TONY CODE
    getUserId(username, callback) {
      let sql = "SELECT id FROM users WHERE username=$username";
      username = username.replace("%40", "@");
      this.db.get(sql, {
        $username: username
      }, (err, rows) => {
        if (err){
          throw(err);
        }
        else if (rows != undefined) {
          return callback(rows.id);
        }
      });
    }

    getWaitTime(attraction, callback){
      let sql = "SELECT average_wait_time FROM attractions WHERE page_address=$attraction";
      this.db.all(sql, {
          $attraction: attraction,
      }, (err, rows) => {
        if (err){
            throw(err);
        }
        else if (rows.length != 0){
            //console.log("ROWS" + rows);
            return callback(rows);
        }  
      });
    }

    getConflicts(attraction, date, startTime, endTime, callback){
      //console.log("THE TIME");
      //console.log(startTime);
      //console.log(endTime);
      let sql = "SELECT * FROM reservations WHERE attractionRideName=$attraction AND date=$date AND time BETWEEN $endTime AND $startTime";
      this.db.all(sql, {
        $attraction: attraction,
        $date: date,
        $endTime: endTime,
        $startTime: startTime
      }, (err, rows) => {

        if (err){
            throw (err);
        }
        else{
            if(row.length != 0) {
                return callback(rows);
            }
        }
      });
    }

    getAttractions(isRestaurant, callback){
        let sql = "SELECT * FROM attractions WHERE isRestaurant=$isRestaurant";
        this.db.all(sql, {
                $isRestaurant:isRestaurant
            }, (err, rows) => {
            if(err) {
                throw(err);
            }
            return callback(rows);
        });
    }

    killOldOnes(lowerBound, callback){
        let sql = "DELETE FROM reservations WHERE (time < $lowerBound)";
        this.db.run(sql, {
            $lowerBound: lowerBound
        }, (err) => {
            if (err) {
                throw(err);
                //console.log(err);
            }
        });
    }

    getTasks(userId, callback){
        //console.log("GOT: " + userId);
        let sql = "SELECT * FROM reservations WHERE user=$userId";
        this.db.all(sql, {
            $userId: userId
        }, (err, rows) => {
            
            if (err){
                throw (err);
            }
            else if (rows.length == 0){
                callback("fail");
            }
            else{
                callback(rows);
            }
            
        });
    }
    
    // Validates if user is admin or not
    // Input: name -> username
    // Input: callback -> callback function handles rows for asynchronous server
    validate(name, callback){
        let sql = "SELECT admin FROM users WHERE username=$name";
        this.db.all(sql, {
            $name: name
        }, (err, rows) => {
            if(err) {
                throw(err);
            }
            if(rows.length != 0) {
                return callback(rows[0].admin);
            }
        });
    } // validate()

    addAttraction(name, page, imageLocation, isRestaurant, averageWaitTime, description) {
        let sql = "INSERT INTO attractions(name, page_address, average_wait_time, imagelocation, description, isRestaurant) VALUES ($name, $page, $waitTime, $imagelocation, $description, $isRestaurant)";
        this.db.run(sql, {
            $name: name,
            $page: page,
            $imagelocation: imageLocation,
            $waitTime: averageWaitTime,
            $description: description,
            $isRestaurant: isRestaurant,
        }, (err) => {
            if(err) {
                throw(err);
            }
        });
    }

    // Gets attraction where page is = to the input page
    getAttractionByPage(page, callback) {
        let sql = "SELECT id FROM attractions WHERE page_address=$page";
        this.db.get(sql, {
            $page: page
        }, (err, row) => {
            if(err) {
                throw(err);
            }
            //console.log("ATTRACTION ID: " + row.id);
            return callback(row.id);
        });
    }

}; /* Queries */

module.exports = Queries;