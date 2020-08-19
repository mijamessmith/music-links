const express = require("express");
const router = express.Router();
const db = require("../controller/db")

//middleware for checking if teachers are logged in 

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


router.get('/', function (req, res, next) {
    res.render('pages/landing');
});

router.get('/login', alreadyLoggedIn, function (req, res, next) {
    res.render('pages/login');
});

router.post("/loginUser", async (req, res, next) => {
    var message;
    console.log(req.body)
    console.log(`Sent in a post using email: ${req.body.teacherEmail} and password: ${req.body.teacherPassword}.`)
    try {
            db.pool.query(`SELECT * FROM user_data WHERE email = "${req.body.teacherEmail}" AND password = "${req.body.teacherPassword}"`, (error, results) => {
                if (error) {
                    console.log(error);
                } else if (results.length === 0) {
                    message = { message: "The email or password is incorrect" }
                    console.log(message);
                    res.status(401).render("pages/login", message)
                } else if (results.length > 0) {               
                    req.session.currentUser = results[0];  
                    console.log(req.session.currentUser, req.session.currentUserId)
                    res.render("pages/teachers");
                }
            })
    } catch (error) {
        console.log(error)
    }
})





router.get('/register', alreadyLoggedIn, function (req, res, next) {
    res.render('pages/register');
});

router.get('/students', function (req, res, next) {
    res.render('pages/students');
});

router.get("/teachers", isLoggedIn, function (req, res, next) {
    res.render("pages/teachers");
})

router.post("/addMusic", isLoggedIn, function (req, res, next) {
    var message;
    return db.pool.query(`INSERT INTO posts (id, description, link, title) 
    VALUES
    ("${req.session.currentUser.id}", "${req.body.description}", "${req.body.link}", "${req.body.postTitle}")`, (err, result) => {
            if (err) throw err;
            else {
                message = { message: "Successfully posted the music link" }
                console.log("success")
                res.render("pages/teachers", message);
            }
    });
})

router.get("/getPosts", (req, res, next) => {
    try {
        db.pool.query(`SELECT * FROM posts WHERE id = "${req.session.currentUser.id}"`, (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                message = { message: "Make a post" }
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

router.get("/getPostsForStudents", (req, res, next) => {
    try {
        db.pool.query(`SELECT * FROM posts WHERE email = "${req.query.email}"`, (error, results) => {
            if (error) {
                console.log(error);
            } else if (results.length === 0) {
                message = { message: "Not a registered teacher email or teacher has not made a post yet" }
                console.log(message);
                res.render("pages/students", message)
            } else if (results.length > 0) {
                console.log(results)
                res.send(results);
            }
        })
    } catch (error) {
        console.log(error)
    }
})



router.post("/registerUser", (req, res, next) => {
    
    return db.pool.query(`INSERT INTO user_data (name, email, password) 
    VALUES ("${req.body.name}", "${req.body.email}", "${req.body.password}")`, (err, result) => {
            if (err) throw err;
            else {
                res.render("pages/teachers");
            }
    });
});


router.get("/logout", isLoggedIn, (req, res, next) => {

    req.session.destroy(); //Kill Session
    console.log(req.session)
    res.send("logged out");
});


module.exports = router;