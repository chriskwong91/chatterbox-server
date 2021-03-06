var _ = require('underscore');
var fs = require('file-system');
var path = require('path');

var ObjectID = require('mongodb').ObjectID;

var statusCode;


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

  request.url = '../client' + request.url;

  var filePath = request.url;
  console.log(filePath);
  if (filePath === '../client/') {
    filePath = '../client/index.html';
  }
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
  case '.js':
    contentType = 'text/javascript';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  case '.json':
    contentType = 'application/json';
    break;
  case '.png':
    contentType = 'image/png';
    break;
  case '.jpg':
    contentType = 'image/jpg';
    break;
  case '.wav':
    contentType = 'audio/wav';
    break;
  }

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if (request.method === 'GET' && request.url === '../client/classes/messages') {
        statusCode = 200;
        response.writeHead(200, headers);

        response.end(JSON.stringify(storage));
      } else if (request.method === 'OPTIONS' || request.url === '../client/classes/messages/?order=-createdAt') {
        statusCode = 200;
        response.writeHead(200, headers);

        var sortedStorage = {results: []};
        sortedStorage.results = _.sortBy(storage.results, 'createdAt');

        response.end(JSON.stringify(sortedStorage));
      } else if (request.method === 'POST') {
        statusCode = 201;
        response.writeHead(statusCode, headers);

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
        statusCode = 404;
        response.writeHead(statusCode, headers);
        response.end();
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });


  console.log('Server running at http://127.0.0.1:3000/');
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.

  // See the note below about CORS headers.

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.


  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // response.end(JSON.'test');
};


