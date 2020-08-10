const express = require("express");
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('pages/landing');
});

router.get('/login', function (req, res, next) {
    res.render('pages/login');
});

router.get('/register', function (req, res, next) {
    res.render('pages/register');
});




module.exports = router;