var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

/**
* Get port from environment and store in Express.
*/
app.set('port', process.env.PORT || '3000');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('*/public/*', function (req, res, next) {
  res.sendFile(path.join(__dirname + req.path));
});

app.get('/*', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

var server = http.createServer(app);

/**
* Listen on provided port, on all network interfaces.
*/
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
