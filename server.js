var settings = require('./settings');

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

app.configure(function(){
    // We're going to run this behind nginx in production.
    app.enable('trust proxy');
    app.set('port', 8888);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(settings.session_secret));
    app.use(express.session());
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/www' }));
    app.use(express.static(path.join(__dirname, 'www')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/hello.txt', function(req, res){
    res.send('Hello World!');
});

app.get('/home', routes.index);

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
