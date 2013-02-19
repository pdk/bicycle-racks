var settings = require('./settings');

var express = require('express');
var connect = require('connect');

var app = express();

// We're going to run this behind nginx in production.
app.enable('trust proxy');

app.use(connect.cookieParser);
app.use(connect.cookieSession({ secret: settings.session_secret }));
app.use(express.static('www'));

app.listen(8888);
console.log('Listening on port 8888');
