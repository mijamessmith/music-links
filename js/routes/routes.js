const express = require("express");
const router = express.Router();
const db = require("../controller/db")

router.get('/', function (req, res, next) {
    res.render('pages/landing');
});

router.get('/login', function (req, res, next) {
    res.render('pages/login');
});

router.get('/register', function (req, res, next) {
    res.render('pages/register');
});

router.get('/students', function (req, res, next) {
    res.render('pages/students');
});

router.post("/registerUser", (req, res, next) => {
    
    return db.pool.query(`INSERT INTO user_data (name, email, password) 
    VALUES ("${req.body.firstName}", "${req.body.lastName}", "${req.body.email}", "${req.body.password}")`, (err, result) => {
        if (err) throw err;
        else res.redirect("pages/links");
    });
});


module.exports = router;