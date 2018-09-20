var db = require('../models');
var jwt = require('jsonwebtoken');
var sendmail = require("../sendEmail.js");
var sendsms = require("../sendSMS.js");
var bcrypt = require("bcrypt");

var express = require('express');
var router = express.Router();

router.post('/api/emailValidate', (req, res) => {
    console.log("req.body.email: " + req);
    db.User.findOne({
        where: {
            email: req.body.email
        }
    }).then(function (dbUser) {
        //console.log(err);

        if (dbUser !== null) {

            res.json({
                validate: true
            });
        } else {
            res.json({
                validate: false
            });
        }
    });
});

router.post('/api/login', (req, res) => {
    console.log("req.body.email: " + req.body.email);
    db.User.findOne({
        where: {
            email: req.body.email,

        }
    }).then(function (dbUser) {
        if (dbUser !== null) {
            var password = req.body.pass;
            var isPasswordCorrect = bcrypt.compareSync(password, dbUser.password); // true
            if (isPasswordCorrect) {
                var user = dbUser.username;
            
                jwt.sign({ user }, 'secretkey', { expiresIn: '300s' }, (err, token) => {
                    res.json({
                        validate: true,
                        message: 'Welcome ' + dbUser.firstname,
                        token: token,
                        id: dbUser.id,
                        firstName: dbUser.firstname,
                        lastName: dbUser.lastname,
                        email: dbUser.email
                    });
                });
            } else {
                res.json({
                    validate: false,
                    message: 'Incorrect Password, Please try again'
                });
            }
        } else {
            res.json({
                validate: false,
                message: 'User Name not found, Please try again'
            });
        }
    });
});

router.post('/api/userpost', (req, res) => {
    var salt = bcrypt.genSaltSync(10);
    // Hash the password with the salt
    var hash = bcrypt.hashSync(req.body.password, salt);
    db.User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.firstname,
        password: hash
    }).then(function (dbUser) {

        if (dbUser !== null) {
            try{
                sendSMS(dbUser.email,dbUser.firstname,dbUser.lastname,dbUser.password);
            }
            catch(err){
                console.log("error sending sms to new user: "+err);
            }

            try{
                sendEmailToNewUser(dbUser.email, dbUser.firstname,dbUser.lastname, dbUser.password);
            }
            catch(err){
                console.log("error sending email to new user: "+err);
            }
            
            var user = dbUser.username;
            jwt.sign({ user }, 'secretkey', { expiresIn: '300s' }, (err, token) => {
                console.log("token: " + token);
                res.json({
                    validate: true,
                    message: 'Welcome ' + dbUser.firstname,
                    token: token,
                    id: dbUser.id,
                    firstName: dbUser.firstname,
                    lastName: dbUser.lastname,
                    email: dbUser.email
                });
            });
        } else {
            res.json({
                validate: false
            });
        }
    });
});

function sendEmailToNewUser(email, firstName,lastname, password) {
    var emailBody = 'Hello '+firstName+' '+lastname+',\n'+'Welcome to Lost and Found App\n'+'Your Registration has been done successfully\n\n'
    +'You can log in by below credentials:\n'
    +'Username: '+email+'\n'
    +'Password: '+password+'\n'
    +'\n'
    +'Regards,\n'
    +'Lost and Found Development Team'
    var emailSubject = firstName + ' Welcome to Lost and Found App'
    var sendUserEmail = new sendmail(email, emailSubject, emailBody);
};

// Format of token
//Authorization: Bearer <access_token>
function sendSMS(email, firstName,lastname, password) {
    var phoneNumber = "14165709944";
    var message = 'Hello '+firstName+' '+lastname+',\n'+'Welcome to Lost and Found App\n'+'Your Registration has been done successfully\n'
    +'You can log in by below credentials:\n'
    +'Username: '+email+'\n'
    +'Password: '+password+'\n'
    +'\n'
    +'Regards,\n'
    +'Lost and Found Development Team'
    var emailSubject = firstName + ' Welcome to Lost and Found App'
    var messageType = "ARN";
    var newsendSMS = new sendsms(phoneNumber, message, messageType);
};

// Verify Token
function verifytoken(req, res, next) {
    //Get auth header value
    console.log(req.headers);
    const bearerHeader = req.headers['authorization'];
    //Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        //Set the token
        req.token = bearerToken;
        //next middleware
        next();
    } else {
        //Forbidden
        res.sendStatus(403);
    }
}

module.exports = router;