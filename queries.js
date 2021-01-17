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
// 
function reserve() {

} /* reserve */

export { login, signup, reserve };