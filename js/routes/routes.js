const express = require("express");
const router = express.Router();
const db = require("../controller/db")
const bcrypt = require("bcryptjs")
const passwordValidator = require('password-validator');

//create password Schema

var schema = new passwordValidator();

// Add properties to it

    schema.is().min(7)                                    // Minimum length 7
    schema.is().max(64)                                  // Maximum length 64
    schema.has().uppercase()                              // Must have uppercase letters
    schema.has().lowercase()                              // Must have lowercase letters
    schema.has().digits(2)                                // Must have at least 2 digits
    schema.has().not().spaces()                           // Should not have spaces

//middleware functions

// checking if teachers are logged in 

isLoggedIn = function (req, res, next) {
    if (req.session.currentUser) {
        next();
    } else {
        res.redirect("/login")
    }
}

alreadyLoggedIn = function (req, res, next) {
    if (req.session.currentUser) {
        res.redirect("/teachers")
    } else next()
}

//checking if a user is new or not

loginMessage = function (req, res, next) {
    if (req.session.currentUser && req.session.currentUser.messageAfterRegistering !== undefined) {
        req.session.currentUser.message = req.session.currentUser.messageAfterRegistering;
        delete req.session.currentUser.messageAfterRegistering;
        next();
    } else if (req.session.currentUser === undefined) {
        next()
    }
}

homeMessage = function (req, res, next) {
    try {
        db.pool.query(`SELECT * FROM posts WHERE id = "${req.session.currentUser.id}"`, (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                req.session.currentUser.messageForLoggingIn = "Welcome. To make your first music link, make a post below by copying a link to a PDF and adding a title and a description"
                next();
            } else if (results.length > 0) {
                req.session.currentUser.messageForLoggingIn = `Welcome Back, ${req.session.currentUser.name}` 
                next();
            }
        })
    } catch (error) {
        console.log(error)
    }
}

isRegistered = function (req, res, next) {
    try {
        db.pool.query(`SELECT * FROM user_data WHERE email = "${req.body.email || req.query.email}"`, (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                req.session.uniqueEmailForRegistration = true
                next();
            } else if (results.length > 0) {
                req.session.uniqueEmailForRegistration = false
                next();
            }
        })
    } catch (error) {
        console.log(error)
    }
}

validEmail = function (req, res, next) {
    try {
        db.pool.query(`SELECT * FROM user_data WHERE email = "${req.body.email || req.query.email}"`, (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                req.session.uniqueEmailForRegistration = true
                next();
            } else if (results.length > 0) {
                req.session.uniqueEmailForRegistration = false
                next();
            }
        })
    } catch (error) {
        console.log(error)
    }
}


router.get('/', function (req, res, next) {
    res.render('pages/landing');
});

router.get('/login', alreadyLoggedIn, loginMessage, function (req, res, next) {
    var message = false
    if (req.session.message) {
         message = req.session.message
    }
    res.render('pages/login', {message: message})
});

router.post("/loginUser", async (req, res, next) => {
    const { teacherEmail, teacherPassword } = req.body;
    var message;
    console.log(req.body)
    console.log(`Sent in a post using email: ${req.body.teacherEmail} and password: ${req.body.teacherPassword}.`)
    try {
        db.pool.query(`SELECT * FROM user_data WHERE email = "${teacherEmail}"`, async (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                message = { message: "That email is not registered" }
                console.log(message);
                res.render("pages/login", message)
            } else if (results.length > 0) {
                user = results[0]
                const validPassword = await bcrypt.compare(teacherPassword, user.password) //returns true or false
                if (validPassword) {
                    req.session.currentUser = results[0];
                    console.log(req.session.currentUser, req.session.currentUserId)
                    res.redirect("/teachers");
                } else {
                    message = { message: "password incorrect" };
                    res.render("pages/login", message);
                }
            }
        })
    } catch (error) {
        console.log(error)
    }
})


//            db.pool.query(`SELECT * FROM user_data WHERE email = "${req.body.teacherEmail}" AND password = "${req.body.teacherPassword}"`, (error, results) => {
//                if (error) {
//                    console.log(error);
//                } else if (results.length === 0) {
//                    message = { message: "The email or password is incorrect" }
//                    console.log(message);
//                    res.status(401).render("pages/login", message)
//                } else if (results.length > 0) {               
//                    req.session.currentUser = results[0];  
//                    console.log(req.session.currentUser, req.session.currentUserId)
//                    res.redirect("/teachers");
//                }
//            })
//    } catch (error) {
//        console.log(error)
//    }
//})





router.get('/register', alreadyLoggedIn, function (req, res, next) {
    var message;
    if (req.session.message) {
        if (req.session.message.includes("did not match") || req.session.message.includes("already registered") || req.session.message.includes("password must be")) {
            message = req.session.message;
        }
    }
    res.render('pages/register', {message: message});
});

router.post("/registerUser", async (req, res, next) => {
    try {
        let hasAccount;
        const { email, password, confirmPassword, name } = req.body;
        if (confirmPassword !== password) {
            req.session.message = "passwords did not match"
            return res.redirect("/register");
        } else if (!schema.validate(password)) {
            req.session.message = "password must be 7-64 characters long, have no spaces, and contain at least 2 numbers and an upper and lowercase letter"
            return res.redirect("/register");
        }
        return db.pool.query(`SELECT * FROM user_data WHERE email = "${req.body.email || req.query.email}"`, async (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                hasAccount = false
            } else if (results.length > 0) {
                hasAccount = true
            } if (hasAccount) {
                req.session.message = "An account with that email is already registered - Please Login"
                res.redirect("/register")
            } else if (!hasAccount) {
                const hash = await bcrypt.hash(password, 10)
                return db.pool.query(`INSERT INTO user_data (name, email, password) 
    VALUES ("${name}", "${email}", "${hash}")`, (err, result) => {
                    console.log(req.body)
                    if (err) throw err;
                    else {
                        //set up an empty currentUser for the time being;
                        req.session.currentUser = {};
                        req.session.currentUser.messageAfterRegistering = `Welcome, ${req.body.name}. Login to access your new account`
                        res.redirect("/login")
                    }
                });
            }
        })
    } catch (e) {
        if (e) throw e;
    }
})





//    try {
//        if (req.session.uniqueEmailForRegistration == true) {
//            db.pool.query(`INSERT INTO user_data (name, email, password) 
//    VALUES ("${req.body.name}", "${req.body.email}", "${req.body.password}")`, (err, result) => {
//                console.log(req.body)
//                if (err) throw err;
//                else {
//                    //set up an empty currentUser for the time being;
//                    req.session.currentUser = {};
//                    req.session.currentUser.messageAfterRegistering = `Welcome, ${req.body.name}. Login to access your new account`
//                    res.redirect("/login")
//                }
//            });
//        } else if (uniqueEmailForRegistration == false) {
//            res.session.message = "Email already registered"
//            res.redirect("/login")
//        }
//    } catch (error) {
//        console.log(error)
//    }
//})



router.get('/students', function (req, res, next) {
    var message;
    if (req.session.message) {
        if (req.session.message.includes("not made posts")) {
            message = req.session.message;
            res.render('pages/students', { message: message })
        } else {
            message = req.session.message
            res.render("pages/students", { message: message })
        }
        //} else if (req.session.uniqueEmailForRegistration == undefined) {
        //    res.render("pages/students")
        //} else if (req.session.uniqueEmailForRegistration == true) {
        //    message = "Not a registered email"
        //    delete req.session.uniqueEmailForRegistration;
        //    res.render('pages/students', {message: message})
    }  else {
        res.render('pages/students', {message: message});
    }
});

router.get("/teachers", isLoggedIn, homeMessage, function (req, res, next) {
    var message = "false"
    if (req.session.currentUser.messageForLoggingIn) {
        message = req.session.currentUser.messageForLoggingIn;
    }
    res.render("pages/teachers", {message: message});
})

router.post("/teachers", isLoggedIn, function (req, res, next) {
    var message;
    return db.pool.query(`INSERT INTO posts (id, description, link, title, email) 
    VALUES
    ("${req.session.currentUser.id}", "${req.body.description}", "${req.body.link}", "${req.body.postTitle}", "${req.session.currentUser.email}")`, (err, result) => {
            if (err) throw err;
            else {
                message = { message: "Successfully posted the music link" }
                console.log("success")
                res.render("pages/teachers", message);
            }
    })
})

router.get("/getPosts", (req, res, next) => {
    try {
        db.pool.query(`SELECT * FROM posts WHERE id = "${req.session.currentUser.id}"`, (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                message = { message: "Welcome. To make your first music link, make a post below by copying a link to a PDF and adding a title and a description" }
                console.log(message);
                res.render("pages/teachers", message)
            } else if (results.length > 0) {
                req.session.currentUser.posts = results;
                res.send(results);
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/deletePost", (req, res, next) => {
    try {
        db.pool.query(`DELETE from posts WHERE link = "${req.query.link}" AND email = "${req.session.currentUser.email}"`, (error, results) => {
            if (error) {
                console.log(error);
                res.send("no");
            } else {
                res.send("yes")
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/getPostsForStudents", (req, res, next) => {
    try {
        db.pool.query(`SELECT * FROM posts WHERE email = "${req.query.email}"`, (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                var message = "Teacher has not made a post yet" 
                req.session.message = message
                console.log(message);
                res.send(message);
            } else if (results.length > 0) {
                console.log(results)
                res.send(results);
            }
        })
    } catch (error) {
        console.log(error)
    }
})





router.get("/logout", isLoggedIn, (req, res, next) => {

    req.session.destroy(); //Kill Session
    console.log(req.session)
    res.send("logged out");
});


module.exports = router;