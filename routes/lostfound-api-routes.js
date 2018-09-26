// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
var path = require('path');
var express = require('express');
var router = express.Router();
var sendmail = require('../sendEmail.js');

// Import the model to use its database functions.
var db = require('../models');
var globalData;
var idData = [];
var idQuery;

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
      console.log('Found Data: ' + JSON.stringify(result));
      idData.push(result);
      console.log('global Data: ' + JSON.stringify(idData));
      res.json(result);
    });
    console.log('Querying the ID');
  });
});

router.get('/browse-by-id-result', function (req, res) {
  console.log('data : ' + req.data);
  res.render('browse-results', { lostItems: idData[0], foundItems: idData[1] });
});

router.get('/lost', function (req, res) {
  db.Lost.findAll({ include: db.User }).then(function (data) {
    res.render('lost', data);
  });
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
      return err;
    }
    res.json(results);
  });
});

// ---------- ROUTES FOR 'FOUND' TABLE 
router.get('/found', function (req, res) {
  db.Found.findAll({ include: db.User }).then(function (data) {
    res.render('found', data);
  });
});

router.get('/browse-found', function (req, res) {
  db.Lost.findAll({ include: db.User }).then(function (data) {
    res.render('browse', data);
  });
});

router.post('/api/found', function (req, res) {
  db.Found.create(req.body).then(function (results) {
    foundId = results.id;
    try {
      sendFoundEnteredEmailToUser(req.body.email, req.body.firstname, req.body.lastname, foundId);
      var user = dbUser.username;
    } catch (err) {
      return err;
    }
    res.json(results);
  });
});

// TO INPUT A CLAIM FOR FOUND ITEM 
router.post('/api/claim/found', function (req, res) {
  var claimQuery = req.body;
  db.Claim.create(req.body)
    .then(function (results) {
      try {
        sendClaimEnteredEmailToUser(req.body.email, req.body.firstname, req.body.lastname, results.id);
        var user = dbUser.username;
      } catch (err) {
        return err;
      }
      // res.json(results)
      db.Found.update({
        claimed: true
      }, {
        where: {
          id: claimQuery.FoundId
        }
      }).then(function (data) {
        res.json(data);
        res.end();
      });
    });
});

// TO INPUT A CLAIM FOR LOST ITEM 
router.post('/api/claim/lost', function (req, res) {
  var claimQuery = req.body;
  console.log('claimQuery: ' + JSON.stringify(claimQuery));
  db.Claim.create(req.body)
    .then(function (results) {
      try {
        sendClaimEnteredEmailToUser(req.body.email, req.body.firstname, req.body.lastname, results.id);
        var user = dbUser.username;
      } catch (err) {
        console.log('error sending Lost Confirmation to user: ' + err);
      }
      db.Lost.update({
        claimed: true
      }, {
        where: {
          id: claimQuery.LostId
        }
      }).then(function (data) {
        res.json(data);
        res.end();
      });
    });
});


// SEND CONFIRMATION EMAILS FOR LOST, FOUND AND CLAIMS
function sendLostEnteredEmailToUser(email, firstName, lastname, itemID) {
  var emailBody = 'Dear ' + firstName + ' ' + lastname + ',\n' + 'Welcome to Lost & Found!\n'
    + 'We are sorry to hear that you have lost an item.  However, we have received your lost item report.\n\n'
    + 'Your unique item ID is: ' + itemID + '\n'
    + 'If another user has found an item that matches your description, they will email you.  Periodically check our Browse section to see if you can find the item listed as a Found Item.\n'
    + '\n'
    + 'Regards,\n'
    + 'Lost and Found Development Team';
  var emailSubject = firstName + ' ' + lastname + ' Confirmation - Your Lost Item Report Has Been Received!';
  var sendUserEmail = new sendmail(email, emailSubject, emailBody);
}

function sendFoundEnteredEmailToUser(email, firstName, lastname, itemID) {
  var emailBody = 'Dear ' + firstName + ' ' + lastname + ',\n' + 'Welcome to Lost & Found!\n'
    + 'We have received your found item report.\n'
    + 'Kudos to you for finding it!\n\n'
    + 'Your unique item ID is: ' + itemID + '\n'
    + 'You will be emailed if the owner attempts to claim this item from the listing.  Otherwise, continue to check our Browse section from time to time. You might be able to find the item you have found listed as a Lost Item.  '
    + '\n'
    + 'Regards,\n'
    + 'Lost and Found Development Team';

  var emailSubject = firstName + ' ' + lastname + ' Confirmation - Your Found Item Report Has Been Received!';
  var sendUserEmail = new sendmail(email, emailSubject, emailBody);
}

function sendClaimEnteredEmailToUser(email, firstName, lastname, claimID) {
  var emailBody = 'Dear ' + firstName + ' ' + lastname + ',\n' + 'Welcome to Lost & Found!\n'
    + 'Our records show you have claimed an item which belongs to you or you have found an item that has been listed as lost.\n\n'
    + 'Your claim ID is: ' + claimID + '\n'
    + 'The email related to that item is: ' + email + '\n'
    + 'Please message the user using the above email address in order to exchange the item.\n'
    + '\n'
    + 'Regards,\n'
    + 'Lost and Found Development Team';
  var emailSubject = firstName + ' ' + lastname + ' Confirmation - You Have Claimed an Item! Please Contact the User!';
  var sendUserEmail = new sendmail(email, emailSubject, emailBody);
}

// Export routes for server.js to use.
module.exports = router;