'use strict';

const fs = require('fs'),
  path = require('path'),
  qs = require('querystring'),
  userEventsModel = require('./app/models/userEventsModel.js'),
  pathToIndex = path.join(__dirname, 'client', 'build', 'index.html');

const trace = (tag, x) => {
  console.log(tag, x);
  return x;
};

Array.prototype.concatAll = function () {
  var results = [];
  this.forEach(function (subArray) {
    if (Array.isArray(subArray))
      subArray.forEach((item) => results.push(item))
    else
      throw new Error('Its not two dimensional array;');
  });
  return results;
};

const collectionToArray = (collection) => {
  return new Promise(function (resolve, reject) {
    collection.find({})
      .toArray(function (err, items) {
        if (err) {
          reject(err);
        } else {
          resolve(items);
        }
      })
  });
}

/***
  * Fetch user data
  *
  */
exports.getUserData = (req, res) => {
  userEventsModel.getUserEventsCollection()
    .then(collectionToArray)
    .then(data => {
      res.send(data);
    })
    .catch(console.error.bind(this));
}

exports.home = (req, res) => {
  fs.createReadStream(pathToIndex)
    .pipe(res);
}

exports.replay = (req, res) => {
  fs.createReadStream(path.join(__dirname, 'Replay', 'index.html'))
    .pipe(res);
};

exports.createUser = (req, res) => {
  userEventsModel.createUser()
    .then(data => {
      res.send(data);
    });
}

exports.saveEvents = (req, res) => {
  userEventsModel.addUserEventByUserId(req.body.id, req.body.events)
    .then(data => {
      res.send(data);
    })
    .catch(console.error.bind(this));
}

exports.getUserEventsByUserId = (req, res) => {
  userEventsModel.getUserEventsByUserId(req.params.id)
    .then(data => {
      res.send(data[0].events.concatAll());
    })
    .catch(e => {
      res.send(e);
    })
}
exports.createUserEventsCollection = userEventsModel.createUserEventsCollection;

exports.webglDemo = (req, res) => {
  fs.createReadStream(path.join(__dirname, 'Lasso', 'index.html'))
    .pipe(res);
}

exports.lists = (req, res) => {
  fs.createReadStream(path.join(__dirname, 'OrderedLists', 'index.html'))
    .pipe(res);
}

exports.test = (req, res) => {
  fs.createReadStream(path.join(__dirname, 'Test', 'index.html'))
    .pipe(res);
}

exports.testDashboard = (req, res) => {
  fs.createReadStream(path.join(__dirname, 'Test', 'dashboard.html'))
    .pipe(res);
}
