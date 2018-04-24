'use strict';

const express = require('express'),
  app = express(),
  Routes = require('./routes.js'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  sessions = require('client-sessions'),
  path = require('path'),
  server = require('http').Server(app),
  io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.on('newTest', function (data) {
    socket.broadcast.emit('newTestDisplay', { data: data });
  });
});

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'client', 'build')));
app.use('/webgl/', express.static(path.join(__dirname, 'Lasso')));
app.use('/replay/', express.static(path.join(__dirname, 'Replay')));
app.use('/orderedLists/', express.static(path.join(__dirname, 'OrderedLists')));
app.use('/test/', express.static(path.join(__dirname, 'Test')));
app.use('/test/', express.static(path.join(__dirname, 'Replay')));
app.use('/testDashboard/', express.static(path.join(__dirname, 'TestDashboard')));

app.get('/', Routes.home);
app.get('/webgl', Routes.webglDemo);
app.get('/orderedLists', Routes.lists);
app.get('/testing', Routes.test);
app.get('/testDashboard', Routes.testDashboard);

app.get('/createUser', Routes.createUser);
app.get('/createUserEventsCollection', Routes.createUserEventsCollection);
app.get('/getUserEventsByUserId/:id', Routes.getUserEventsByUserId);
app.post('/saveEvents', Routes.saveEvents);
app.get('/getAllData', Routes.getUserData);
app.get('/replay', Routes.replay);

server.listen(app.get('port'), function () {
  console.log(`Node app is running on port: ${app.get('port')}`);
});
