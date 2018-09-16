// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
var path = require('path');
var express = require('express');
var router = express.Router();

// Import the model to use its database functions.
var db = require('../models')
var globalData;

// Create all our routes and set up logic within those routes where required.
// ---------- ROUTES FOR 'LOST' TABLE 
router.get('/lost', function (req, res) {
  db.Lost.findAll({ include: db.User }).then(function (data) {
    res.render('lost', data)
  })
});

router.get('/browse-lost-items-result', function(req, res) {
  res.render('browse-results', {lostItems: globalData})
});

router.get('/browse-lost-items', function (req, res) {
  console.log('The request/req.query: ' + JSON.stringify(req.query));
    db.Lost.findAll({
      where: req.query
    }).then(function (data) {
      globalData = data;
      console.log(data);
      console.log('Querying the lost items now...');
    });
  });

router.get('/browse-found-items', function (req, res) {
  console.log('The request/req.query: ' + JSON.stringify(req.query));
  db.Lost.findAll({
    where: req.query
  }).then(function (data) {
    globalData = data;
    console.log(data);
    console.log('Querying the found items now...');
  });
});

router.post('/api/lost', function (req, res) {
  // 
  db.Lost.create(req.body).then(function (data) {
    res.json('lost', data)
  })
});

router.put('/api/lost/:id', function (req, res) {

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

});

router.put('/api/found/:id', function (req, res) {

});

// Export routes for server.js to use.
module.exports = router;