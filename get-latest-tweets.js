#!/usr/bin/env node

var settings = require('./settings');

var twitter = require('ntwitter');

var twit = new twitter({
    consumer_key          : settings.twitter.consumer_key         ,
    consumer_secret       : settings.twitter.consumer_secret      ,
    access_token_key      : settings.twitter.access_token_key     ,
    access_token_secret   : settings.twitter.access_token_secret
});

var MongoClient = require('mongodb').MongoClient;

// twit
//     .verifyCredentials(function (err, data) {
//             console.log(data);
//         });

function get_latest_tweets () {
    // Connect to the db
    MongoClient.connect(settings.mongodb.connect_url, function(err, db) {
      if(err) {
          throw err;
      } else {
        // console.log("mongodb connected");

        db.createCollection('tweets', {safe:true}, function(err, collection) {

            if (err)
                throw err;

            // Get the max tweet id we've fetch so far.
            collection.findOne({}, {fields: ["_id"]}, {sort: {_id: -1}, limit: 1}, function(err, doc) {
                if (err) throw err;

                var max_id = "1";
                if (doc)
                    var max_id = doc['_id'];

                // console.log("max previous tweet id: " + max_id);

                fetch_tweets(max_id);
            });
        
            function fetch_tweets(max_id) {
                // The ntwitter library helper method is not yet up to date
                // with API version 1.1, so we resort to just calling .get().
                twit
                    .get(
                        "/statuses/mentions_timeline.json",
                        {
                            "count": 100, 
                            "include_rts": false, 
                            "include_entities": true,
                            "contributor_details": false,
                            "since_id": max_id
                        },
                        function (err, data) {
                            if (err) {
                                throw err;
                            } else {
                                tcnt = data.length
                                if (tcnt == 0)
                                    process.exit();
                                console.log("found " + tcnt + " new tweets");
                                data.map(save_tweet);
                            }
                        });
            }

            function save_tweet(tweet) {
                tweet['_id'] = tweet['id_str'];
                collection.save(tweet, {safe:true}, function(err, result) {
                    if (err) throw err;
                    console.log("(" + tcnt + ") inserted id_str: " + tweet['id_str'] + ' from @' + tweet['user']['screen_name']);
                    tcnt = tcnt - 1;
                    if (tcnt <= 0) {
                        // All done. Stop running.
                        process.exit();
                    }
                });
            }
        });

      }
    });
}

get_latest_tweets();




