// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
var path = require('path');
var express = require('express');
var router = express.Router();
var sendmail = require("../sendEmail.js");

// Import the model to use its database functions.
var db = require('../models')
var globalData;
var idData = [];
var idQuery;

// Create all our routes and set up logic within those routes where required.
// ---------- ROUTES FOR 'LOST' TABLE 


router.get('/browse-by-id', function (req, res) {
  idQuery = req.query;
  db.Lost.findAll({
    where: {
      id: req.query.id,
      claimed: 0
    }
  }).then(function (data) {

    idData.push(data);
    db.Found.findAll({
      where: {
        id: idQuery.id,
        claimed: 0
      }
    }).then(function (result) {
      console.log("Found Data: " + JSON.stringify(result));
      idData.push(result);
      console.log("global Data: " + JSON.stringify(idData));
      res.json(result);
    })
    console.log('Querying the ID')
  })
});

router.get('/browse-by-id-result', function (req, res) {
  console.log("data : " + req.data);
  res.render('browse-results', { lostItems: idData[0], foundItems: idData[1] });
});

router.get('/lost', function (req, res) {
  db.Lost.findAll({ include: db.User }).then(function (data) {
    res.render('lost', data)
  })
});

router.get('/browse-lost-items-result', function (req, res) {
  res.render('browse-results', { lostItems: globalData });
});

router.get('/browse-found-items-result', function (req, res) {
  res.render('browse-results', { foundItems: globalData });
});

router.get('/browse-lost-items', function (req, res) {
  db.Lost.findAll({
    where: req.query
  }).then(function (data) {
    globalData = data;
    res.json(data);
  });
});

router.get('/browse-found-items', function (req, res) {
  db.Found.findAll({
    where: req.query
  }).then(function (data) {
    globalData = data;
    res.json(data);

  });
});

router.post('/api/lost', function (req, res) {
  db.Lost.create(req.body).then(function (results) {
     try {
      sendLostEnteredEmailToUser(req.body.email, req.body.firstname, req.body.lastname, results.id);
      var user = dbUser.username;
    } catch (err) {

    }
    res.json(results);
  })
});

router.put('/api/lost/:id', function (req, res) {
  db.Lost.update({
    claimed: true,
  }, {
      where: {
        id: req.body.id
      }
    }).then(function (results) {
      res.json(results)
      res.end();
    })
});

// ---------- ROUTES FOR 'FOUND' TABLE 
router.get('/found', function (req, res) {
  db.Found.findAll({ include: db.User }).then(function (data) {
    res.render('found', data)
  })
});

router.get('/browse-found', function (req, res) {
  db.Lost.findAll({ include: db.User }).then(function (data) {
    res.render('browse', data)
  })
});

router.post('/api/found', function (req, res) {
  db.Found.create(req.body).then(function (results) {
    foundId = results.id;
 try {
      sendFoundEnteredEmailToUser(req.body.email, req.body.firstname, req.body.lastname,  foundId);
      var user = dbUser.username;
    } catch (err) {
      console.log("error sending Found Confirmation to user: " + err);
    }
    res.json(results)
  })
});

router.put('/api/found/:id', function (req, res) {
  db.Found.update({
    claimed: true,
  }, {
      where: {
        id: req.body.id
      }
    }).then(function (results) {
      res.json(results)
      res.end();
    })
});

// TO INPUT A CLAIM
router.post('/api/claim', function (req, res) {
  db.Claim.create(req.body).then(function (results) {
    try {
      sendClaimEnteredEmailToUser(req.body.email, req.body.firstname, req.body.lastname, results.id);
      var user = dbUser.username;
    } catch (err) {
      console.log("error sending Lost Confirmation to user: " + err);
    }
    res.json(results)
  });
});

// SEND CONFIRMATION EMAILS FOR LOST, FOUND AND CLAIMS
function sendLostEnteredEmailToUser(email, firstName, lastname, itemID) {
  var emailBody = 'Dear ' + firstName + ' ' + lastname + ',\n' + 'Welcome to Lost and Found App\n'
    + 'We have received your lost item report.\n\n'
    + 'Your unique item ID code is: ' + itemID + '\n'
    + 'You will be informed by Email if we found any items match with your property.\n'
    + '\n'
    + 'Regards,\n'
    + 'Lost and Found Development Team'
  var emailSubject = firstName + ' ' + lastname + ' Confirmation - Lost Item information received'
  var sendUserEmail = new sendmail(email, emailSubject, emailBody);
};

function sendFoundEnteredEmailToUser(email, firstName, lastname, itemID) {
  var emailBody = 'Dear ' + firstName + ' ' + lastname + ',\n' + 'Welcome to Lost and Found App\n'
    + 'We have received your found item report.\n'
    + 'Thanks for your kind consideration to people properties\n\n'
    + 'Your unique item ID code is: ' + itemID + '\n'
    + 'We will try to find someone who lost this item'
    + '\n'
    + 'Regards,\n'
    + 'Lost and Found Development Team'

  var emailSubject = firstName + ' ' + lastname + ' Confirmation - Found Item information received'
  var sendUserEmail = new sendmail(email, emailSubject, emailBody);
};

function sendClaimEnteredEmailToUser(email, firstName, lastname, claimID) {
  var emailBody = 'Dear ' + firstName + ' ' + lastname + ',\n' + 'Welcome to Lost and Found App\n'
    + 'Our records show you calimed an item which belongs to you or you found an item which is in lost items list\n\n'
    + 'The claims ID is:' + claimID + '\n'
    + 'the email related to that item is:' + email
    + ' You can connect via this email to related user\n'
    + '\n'
    + 'Regards,\n'
    + 'Lost and Found Development Team'
  var emailSubject = firstName + ' ' + lastname + ' Confirmation - Claim Item information received'
  var sendUserEmail = new sendmail(email, emailSubject, emailBody);
};

// Export routes for server.js to use.
module.exports = router;