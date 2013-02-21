var settings = require('./settings');

var assert = require('assert');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongodb = require('mongodb');

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

mongodb.Db.connect(settings.mongodb.connect_url, function(err, db) {
    assert.equal(null, err);
    console.log("connected to mongodb");
    
    db.collection('tweets', {strict:true}, function(err, tweets) {
        assert.equal(null, err);
        console.log("found collection tweets");

        app.get("/query", function(req, res) {
            tweets.find(
                {
                    "coordinates.coordinates": { $exists:1 }
                },
                {
                    id: 1,
                    _id: 0,
                    created_at: 1, 
                    text: 1, 
                    "user.screen_name": 1, 
                    "coordinates.coordinates": 1,
                    "entities.media.media_url": 1,
                    "entities.media.url": 1
                }).toArray(function(err, docs) {
                    if (err) {
                        throw err;
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.write(JSON.stringify(docs));
                        res.end();
                    }
                });
            });

        app.get("/fails", function(req, res) {
            tweets.find(
                { "coordinates.coordinates": { $exists: 0 }}, {}
            ).toArray(function(err, docs) {
                if (err) {
                    throw err;
                } else {
                    res.send(docs);
                }
            });
        });

        http.createServer(app).listen(app.get('port'), function() {
            console.log("Express server listening on port " + app.get('port'));
        });

    });
});
