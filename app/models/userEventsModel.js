
/***************************************************************
Data access layer for user actions.
Author: Md Tauseef
****************************************************************/

var connection = require('./databaseConnection.js');
var uuid = require('uuid/v4');
var getUserEvents = getCollectionByName('userEventsData');
var userEventsCollection = null;

/***************************************************************
Only for debugging
****************************************************************/
function log(x) {
  console.log(x);
  return x;
}

function logError(x) {
  console.error(x);
  return x;
}

function createUserEventsCollection(req, res) {
  return Promise.resolve()
    .then(getUserEventsCollection)
    .then(log)
    .catch(function (e) {
      console.log(e);

      db.createCollection("userEventsData", {
        capped: true,
        size: 5242880,
        max: 5000
      })
        .then(collection => {
          res.send(collection);
        });
    });
}

/***
  * Function factory for getting collection by collection name.
  * Takes the name of the collection and returns a function that
  * takes a DB connection and returns the collection.
  * @param name: name of the collection
  * @return anonymous fn that takes a DB connection and returns a collection
  *
  */
function getCollectionByName(name) {
  return function (db) {
    return new Promise(function (resolve, reject) {
      try {
        var collection = db.collection(name);
      } catch (e) {
        reject(e);
      }
      resolve(collection);
    });
  }
}

createUser = () => {
  return new Promise(function (resolve, reject) {
    getUserEventsCollection()
      .then(function (collection) {
        var generatedUserId = uuid();
        try {
          collection.insertOne({
            id: generatedUserId,
            events: []
          });
        } catch (e) {
          reject(e);
        }
        resolve(generatedUserId);
      });
  });
}

/***
  * Getting events for a particular user, based on their userId.
  * @param userId: id of the userId
  *
  */
function getUserEventsByUserId(userId) {
  return getUserEventsCollection()
    .then(function (collection) {
      return new Promise(function (resolve, reject) {
        collection.find({
          id: userId
        })
          .toArray(function (err, items) {
            if (err) {
              reject(err);
            } else {
              resolve([...items]);
            }
          });
      });
    });
}


/***
  * Add user's action event to the database
  * @param userId: id of the userId
  * @param event: id of the question
  *
  */
function addUserEventByUserId(userId, events) {
  return getUserEventsCollection()
    .then(function (collection) {
      return new Promise(function (resolve, reject) {
        collection.update(
          { id: userId },
          {
            $push: {
              events: events.map(e => {
                return {
                  timestamp: e.timestamp,
                  type: e.type,
                  target: e.target,
                  pageX: e.pageX,
                  pageY: e.pageY // TODO: make it extensible for other than mouse events
                }
              })
            }
          },
          {
            upsert: true
          },
          function (err, data) {
            if (err) {
              reject(err);
            } else {
              if (data.result.nModified === 0 && data.result.nUpserted === 0) {
                var writeError = new Error("Failed to add response!");
                writeError.status = 500;
                reject(writeError);
              }
              resolve(data);
            }
          }
        )
      });
    });
}


/***
  * Fetches the whole user actions collection
  *
  */
function getUserEventsCollection() {
  if (userEventsCollection == null) {
    userEventsCollection = connection
      .then(getUserEvents);
  }
  return userEventsCollection;
}

module.exports = {
  addUserEventByUserId: addUserEventByUserId,
  createUserEventsCollection: createUserEventsCollection,
  getUserEventsByUserId: getUserEventsByUserId,
  createUser: createUser,
  getUserEventsCollection: getUserEventsCollection
}
