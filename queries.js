const sqlite3 = require('sqlite3').verbose();

class Queries{
    db = new sqlite3.Database('./testdb.db');
    
    // login function
    // checks if database query @ username has password = input password
    // input: username -> username used for finding user in database
    // input: password -> checks if found user has this password
    login(username, password) {
        let sql = "SELECT password FROM users WHERE username=$username"
        db.run(sql, {
            $username: username
        },
        (err, rows, callback) => {
            // there should not be an error or more than one user found
            if(err) {
                throw(err);
            } else if (rows.length > 1) {
                return false;
            }
            // logins in if password is correct
            if (rows[0] == password) {
                return callback(true);
            }
            return callback(false);
        });
    } /* login */

    // sign up function
    // checks to see if username is already taken and returns false if it is
    // if not -> inserts username and a HASHED password into table and returns true
    // input: username -> username being used to create an account
    // input: password -> password being used to keep account safe
    // input: email -> email of user to receive updates
    signup(username, password, email) {
        let sql = "SELECT * FROM users WHERE username=$username";
        db.get(sql, {
            $username: username
        }, (err, rows, callback) => {
            if(err) {
                throw(err);
            } else if(!rows) {
                let insert_statement = "INSERT INTO users(username, password, admin, email) VALUES ($username, $password, $admin, $email)";
                db.run(insert_statement, {
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
                return callback(true);
            } else {
                return callback(false);
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
        db.run(sql, {
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
        db.run(sql, {
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
        db.run(sql, {
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
}

module.exports = Queries;