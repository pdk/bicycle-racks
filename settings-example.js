var settings = {};

settings.twitter = {};

settings.twitter.consumer_key          = '** your consumer key here **';
settings.twitter.consumer_secret       = '** your consumer secret here **';
settings.twitter.access_token_key      = '** your access token key here **';
settings.twitter.access_token_secret   = '** your access token secret here **';

settings.mongodb = {};

settings.mongodb.connect_url = "mongodb://username:password@serverhostname:portNNNN/databasename"

module.exports = settings;

settings.session_secret = 'random-string-here-for-session-secret';
