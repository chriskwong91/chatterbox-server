/* Import node's http module: */
var express = require('express');
var handleRequest = require('./request-handler');

var app = express();

var port = 3000;
var ip = '127.0.0.1';

app.use(express.static('../client/'));

app.route('/classes/messages')
  .get(function(req, res) {
    handleRequest.requestHandler(req, res);
  })
  .post(function(req, res) {
    handleRequest.requestHandler(req, res);
  });

app.listen(3000, function() {
  console.log('Listening on port 3000...');
});
