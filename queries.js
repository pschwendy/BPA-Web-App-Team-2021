const sqlite3 = require('sqlite3').verbose();
const bcrypt = require("bcrypt");

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
            console.log(rows);
            // there should not be an error or more than one user found
            if(err) {
                throw(err);
            } else if (!rows) {
              console.log("HUH");
              return callback(false);
            } else if (rows.length > 1) {
                return callback(false);
            }
            // logins in if password is correct
            bcrypt.compare(password, rows.password, function(err, result){
              console.log("RES: " + result);
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
                console.log("gave true");
                callback(true);
            } else {
                console.log(rows);
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
        let sql = "INSERT INTO reservations(attractionName, numPeople time, date, user) VALUES ($attraction, $num_people, $time, $date, $user)";
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
    delete_reservation(attraction, account_id, num_people, res_time, res_date) {
        let sql = "DELETE FROM reservations WHERE attractionName=$attraction AND numPeople=$num_people AND time=$time AND date=$date AND user=$user";
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
    update_reservation(attraction, account_id, old_num_people, old_time, old_date, new_num_people, new_time, new_date) {
        let sql = "UPDATE reservations SET numPeople=$new_new_people, time=$new_time, date=$new_date WHERE attractionName=$attraction AND numPeople=$old_num_people AND time=$old_time AND date=$old_date AND user=$user";
        this.db.run(sql, {
            $attraction: attraction,
            $old_num_people: old_num_people,
            $old_time: old_time,
            $old_date: old_date,
            $user: account_id,
            $new_num_people: new_num_people,
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
            return callback(rows);
        });
    } /* getMenu */

    //TONY CODE
    getUserId(username, callback){

      let sql = "SELECT id FROM users WHERE username=$username";
      username = username.replace("%40", "@");
      this.db.get(sql, {
        $username: username
      }, (err, rows) => {

        if (err){
          throw(err);
        }
        else{
          console.log("ROWS: " + rows.id);
          
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
        else{
            console.log("ROWS" + rows);
            return callback(rows);
        }

        
      });

    }

    getConflicts(attraction, date, startTime, endTime){
    
      let sql = "SELECT numPeople FROM reservations WHERE attractionRideName=$attraction AND date=$date AND time BETWEEN $time AND DATEADD(MINUTE, @waitTime, $time)"

    }

    getAttractions(callback){
        let sql = "SELECT * FROM attractions WHERE isRestaurant=TRUE";
        this.db.all(sql
            , (err, rows) => {
            if(err) {
                throw(err);
            }
            //console.log(rows);
            return callback(rows);
        });
    }

}; /* Queries */

module.exports = Queries;
