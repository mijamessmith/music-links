//import modules

const express = require("express");
const bodyParser = require('body-parser');
const ejs = require("ejs");
const uuid = require("uuid")
var session = require('express-session'); 
const app = express(); 


//template engine set
app.set("view engine", "ejs");

app.use(bodyParser.json()); //ensure that the body data is in json
app.use(bodyParser.urlencoded({ extended: false }));

//create session

app.use(session({
    genid: (req) => { //generate id
        console.log('Inside session middleware genid function')
        console.log('Request object sessionID from client: ' + req.sessionID);
        var new_sid = uuid.v4(); //method of uuid version 4
        console.log('New session id generated: ' + new_sid);
        return new_sid; // use UUIDs for session IDs
    },
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))




//setting up rendering of all pages
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/views/pages"));
app.use(express.static(__dirname + "/views/css"));
app.use(express.static(__dirname + "/views/partials"));

//import routes

const routes = require("./js/routes/routes");

app.use("/", routes);

//server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));