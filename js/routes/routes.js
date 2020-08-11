const express = require("express");
const router = express.Router();
const db = require("../controller/db")

router.get('/', function (req, res, next) {
    res.render('pages/landing');
});

router.get('/login', function (req, res, next) {
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
                    req.session.currentUserId = results[0].id;
                    console.log(req.session.currentUser, req.session.currentUserId)
                    res.render("pages/teachers");
                }
            })
    } catch (error) {
        console.log(error)
    }
})





router.get('/register', function (req, res, next) {
    res.render('pages/register');
});

router.get('/students', function (req, res, next) {
    res.render('pages/students');
});

router.get("/teachers", function (req, res, next) {
    res.render("pages/teachers");
})


router.post("/registerUser", (req, res, next) => {
    
    return db.pool.query(`INSERT INTO user_data (name, email, password) 
    VALUES ("${req.body.firstName}", "${req.body.lastName}", "${req.body.email}", "${req.body.password}")`, (err, result) => {
        if (err) throw err;
        else res.redirect("pages/links");
    });
});


module.exports = router;