const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./testdb.db');

// login function
// checks if database query @ username has password = input password
// input: username -> username used for finding user in database
// input: password -> checks if found user has this password
function login(username, password) {
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
function signup(username, password, email) {
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
function reserve(attraction, account_id, num_people, res_time, res_date) {
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

export { login, signup, reserve };