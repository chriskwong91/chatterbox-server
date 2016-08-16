var _ = require('underscore');
var fs = require('file-system');
var path = require('path');

var ObjectID = require('mongodb').ObjectID;

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var headers = defaultCorsHeaders;
headers['Content-Type'] = 'text/plain';

var Message = function(username, message, roomname, createdAt) {
  this.username = username || 'username';
  this.message = message;
  this.roomname = roomname || 'Lobby';
  this.createdAt = createdAt;
  this.objectId = new ObjectID();
};

var storage;

fs.readFile('messageStorage.txt', function read(err, data) {
  if (err) {
    throw err;
  }
  if (data) {
    storage = JSON.parse(data);
  } else {
    storage = {results: []};
  }
});

exports.defaultCorseHeaders = defaultCorsHeaders;

exports.requestHandler = function(request, response) {

  if (request.method === 'GET' && request.url === '/classes/messages') {
    response.writeHead(200, headers);

    response.end(JSON.stringify(storage));
  } else if (request.method === 'OPTIONS' || request.url === '/classes/messages/?order=-createdAt') {
    response.writeHead(200, headers);

    var sortedStorage = {results: []};
    sortedStorage.results = _.sortBy(storage.results, 'createdAt');

    response.end(JSON.stringify(sortedStorage));
  } else if (request.method === 'POST') {
    response.writeHead(201, headers);

    var result = '';
    request.on('data', function(data) {
      result += data;
    });

    request.on('end', function() {
      var parsed = JSON.parse(result);
      var newMessage = new Message(
        parsed.username,
        parsed.message,
        parsed.roomname,
        new Date()
      );
      storage.results.push(newMessage);
      fs.writeFile('messageStorage.txt', JSON.stringify(storage), function(err) {
        if (err) { return console.log(err); }

      });
    });

    response.end();
  } else {
    response.writeHead(404, headers);
    response.end();
  }

  console.log('Serving request type ' + request.method + ' for url ' + request.url);
};


