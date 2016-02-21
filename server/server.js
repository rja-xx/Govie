// server.js

// BASE SETUPsdhttps://github.com/rja-xx/Govie.gitv
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var User = require('./model/user');
var Rate = require('./model/rate');
var Profile = require('./model/profile');
var MovieSearch = require('./model/movie_search');
var Movie = require('./model/movie');
var Config = require('./config');
var uuid = require('uuid');
var url = require('url');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var _ = require('underscore');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var owasp = require('owasp-password-strength-test');
var feed = require("feed-read");
var request = require('request');
var mqtt = require('mqtt');
var expressWs = require('express-ws')(app);
owasp.config({
    allowPassphrases: true,
    maxLength: 128,
    minLength: 6,
    minPhraseLength: 10,
    minOptionalTestsToPass: 2,
});
mongoose.connect(Config.database);

var sfRssFeedReader = function (err, articles) {
    if (err) throw err;
    var filteredArticles = _.filter(articles, function (article) {
        return article.title.indexOf('(VIP)') == -1 &&
            article.title.indexOf('IMAX') == -1 &&
            article.title.indexOf('ATMOS') == -1 &&
            article.title.indexOf('(eng tal)') == -1 &&
            article.title.indexOf('(sv tal)') == -1 &&
            article.title.indexOf('Klassiker - ') == -1 &&
            article.title.indexOf('(Barnvagnsbio)') == -1;
    });
    _.each(filteredArticles, function (sfMovie) {
        MovieSearch.find({sfTitle: sfMovie.title}, function (err, res) {
            if (err) {
                console.log(err);
            } else if (res.length === 0) {
                request('http://api.themoviedb.org/3/search/movie?api_key=' + Config['tmdb-api-key'] + '&year=2016&query=' + encodeURIComponent(sfMovie.title), function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var tmdbSearchResult = JSON.parse(body);
                        if (tmdbSearchResult.results.length === 1) {
                            request('http://api.themoviedb.org/3/movie/' + tmdbSearchResult.results[0].id + '?api_key=' + Config['tmdb-api-key'], function (error, response, body) {
                                var tmdbMovie = JSON.parse(body);
                                var movie = new Movie();
                                movie.title = tmdbMovie.title;
                                movie.tmdbId = tmdbMovie.id;
                                movie.posterUrl = tmdbMovie.poster_path;
                                movie.backdropUrl = tmdbMovie.backdrop_path;
                                movie.popularity = tmdbMovie.popularity;
                                movie.save();
                                console.log("Lagret " + movie.title + " i databasen.");
                            });
                        }
                        console.log(sfMovie.title + " Ga 0 eller fler enn ett treff");
                        var movieSearch = new MovieSearch();
                        movieSearch.sfTitle = sfMovie.title;
                        movieSearch.result = tmdbSearchResult.results.length;
                        movieSearch.save();
                    }
                });
            }
            console.log(sfMovie.title + " er allerede behandlet!");
        });
    });
};

console.log('Starting server at ' + new Date());
var CronJob = require('cron').CronJob;
new CronJob('* * * 20 0 0', function () {
    console.log('Starting rss reader at ' + new Date());
    feed("http://www.sf.se/sfmedia/external/rss/premieres.rss", sfRssFeedReader);
    feed("http://www.sf.se/sfmedia/external/rss/topten.rss", sfRssFeedReader);
}, null, true, 'Europe/Oslo');

client = mqtt.createClient(1883, 'localhost');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    console.log("Adding access headers!");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.set('superSecret', Config.secret);

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================

app.post('/addUser', function (req, res) {
    console.log("adding user: " + JSON.stringify(req.body));
    var errors = [];
    var passwordStrength = owasp.test(req.body.password);
    if (!passwordStrength.strong) {
        errors = passwordStrength.errors;
    }

    var user = new User();
    user.alias = req.body.alias;
    user.username = req.body.username;
    user.salt = uuid.v4();
    user.password = req.body.password;
    user.password = crypto.createHmac('sha1', user.salt).update(user.password).digest('hex');
    User.find({$or: [{username: user.username}, {alias: user.alias}]}, function (err, users) {
            if (users.length > 0) {
                _.each(users, function (u) {
                    if (u.username === user.username) {
                        errors.push('Username is in use')
                    }
                    if (u.alias === user.alias) {
                        errors.push('Alias is in use')
                    }
                });
            }
            if (errors.length > 0) {
                res.status(400).json({message: 'Client error', errors: errors});
                return res;
            } else {
                user.save(function (err, updatedUser) {
                    if (err) {
                        res.status(500).json({message: "Server error!", errors: [err]});
                        return res;
                    } else {
                        var profile = new Profile();
                        profile.username = user.username;
                        profile.followers = [];
                        profile.following = [];
                        profile.movies = 0;
                        profile.save(function (err) {
                            if (err) {
                                res.status(500).json({message: "Server error!", errors: [err]});
                                return res;
                            }
                            else {
                                var token = jwt.sign(user, app.get('superSecret'), {
                                    expiresInMinutes: 1
                                });
                                res.status(200).json({token: token, profile: profile});
                                return res;
                            }
                        });
                    }
                });
            }
        }
    );
});

app.post('/authenticate', function (req, res) {
    console.log("Authenticate user: " + JSON.stringify(req.body))
    var password = req.body.password;
    User.find({username: req.body.username}, function (err, user) {
        if (user.length === 1 && user[0].password === crypto.createHmac('sha1', user[0].salt).update(password).digest('hex')) {
            var token = jwt.sign(user, app.get('superSecret'), {
                expiresInMinutes: 1
            });
            res.status(200).json({token: token});
            return res;
        } else {
            res.status(403).json({message: "invalid login"});
            return res;
        }
    });
});


var router = express.Router();              // get an instance of the express Router

router.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                if (Array.isArray(decoded)) {
                    req.decoded = decoded[0];
                } else {
                    req.decoded = decoded;
                }
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

router.route('/wall').get(function (req, res) {
    console.log("returning wall");
    var wall = [];
    Profile.find({followers: req.decoded.username}).exec().then(function (profiles) {
        profiles.push({username: req.decoded.username})
        var promises = _.map(profiles, function (profile) {
            return Rate.find({username: profile.username}).exec();
        });
        _.each(promises, function (promise) {
            promise.then(function (rates) {
                _.forEach(rates, function (rate) {
                    wall.push(rate);
                });
            });
        });
        mongoose.Promise.all(promises).then(function () {
            res.json({
                wall: _.sortBy(wall, function (rate) {
                    return rate.time;
                }).reverse()
            });
            return res;
        });
    });
});

router.route('/tickets').get(function (req, res) {
    console.log("returning tickets");
    Rate.find({friends: req.decoded.username}, null, {sort: {time: -1}}, function (err, ratings) {
        res.json({tickets: ratings});
        return res;
    });
});

router.route('/findMovie').get(function (req, res) {
    var searchterm = req.query.searchterm;
    console.log("finding movies for searchterm " + searchterm);
    Movie.find({title: {'$regex': ".*" + searchterm + ".*"}}, null, {sort: {popularity: 1}}).limit(10).exec(function (err, hits) {
        res.json({hits: hits});
        return res;
    });
});

router.route('/profile').get(function (req, res) {
    console.log("returning profile");
    Profile.find({username: req.decoded.username}, function (err, profile) {
        res.json({profile: profile[0]});
        return res;
    });
});
router.route('/ratings').get(function (req, res) {
    console.log("returning ratings");
    Rate.find({username: req.query.username}).sort({time: -1}).exec(function (err, ratings) {
        res.json({ratings: ratings});
        return res;
    });
});
router.route('/follow').post(function (req, res) {
    if (req.decoded.username === req.body.username) {
        res.status(401).json({message: 'Cant follow yourself'});
        return res;
    }
    Profile.update(
        {username: req.decoded.username},
        {$push: {follows: req.body.username}},
        {upsert: true},
        function (err) {
            if (err) {
                console.log(err);
            } else {
                Profile.update(
                    {username: req.body.username},
                    {$push: {followers: req.decoded.username}},
                    {upsert: true},
                    function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            client.publish('follow/' + req.body.username, req.decoded.username);
                            res.status(200).json({message: 'ok'});
                            return res;
                        }
                    }
                );
            }
        });
});
router.route('/unfollow').post(function (req, res) {
    Profile.update(
        {username: req.decoded.username},
        {$pull: {follows: req.body.username}},
        {upsert: true},
        function (err) {
            if (err) {
                console.log(err);
            } else {
                Profile.update(
                    {username: req.body.username},
                    {$pull: {followers: req.decoded.username}},
                    {upsert: true},
                    function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            //client.publish('unfollow/' + req.body.username, req.decoded.username);
                            res.status(200).json({message: 'ok'});
                            return res;
                        }
                    }
                );
            }
        }
    );
});

router.route('/search').get(function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    console.log("searching profiles matching " + query.term);
    Profile.find({"username": {'$regex': ".*" + query.term + ".*"}}, function (err, profiles) {
        res.json({
            profiles: _.filter(profiles, function (profile) {
                return profile.username !== req.decoded.username;
            })
        });
        return res;
    });
});
router.route('/rate').post(function (req, res) {
    var rate = new Rate();
    rate.username = req.decoded.username;
    rate.movie = req.body.movie;
    rate.posterUrl = 'http://image.tmdb.org/t/p/w300/' + req.body.posterUrl;
    rate.friends = req.body.friends;
    rate.note = req.body.note;
    rate.rate = req.body.rate;
    rate.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Saved rating of " + rate.movie);
                Profile.update(
                    {username: req.decoded.username},
                    {$inc: {movies: 1}},
                    {upsert: false},
                    function (err) {
                        res.status(200).json({"message": 'ok'});
                        return res;
                    });
            }
        }
    );
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});

});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/govie', router);

app.ws('/follow', function (ws, req) {
    jwt.verify(req.query.token, app.get('superSecret'), function (err, decoded) {
        if (err) {
            return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
            var wsClosed = false;
            if (Array.isArray(decoded)) {
                req.decoded = decoded[0];
            } else {
                req.decoded = decoded;
            }
            client.subscribe('follow/' + req.decoded.username);
            console.log("subscribe('follow/'" + req.decoded.username);
            client.on('message', function (topic, msg) {
                console.log("got mqtt topic" + topic + " msg " + msg);
                if (topic == ('follow/' + req.decoded.username) && !wsClosed) {
                    ws.send(msg);
                }
            });
            ws.on('close', function () {
                console.log("unsubscribe('follow/'" + req.decoded.username);
                client.unsubscribe('follow/' + req.decoded.username);
                wsClosed = true;
            });
        }
    });
});

app.ws('/unfollow', function (ws, req) {
    jwt.verify(req.query.token, app.get('superSecret'), function (err, decoded) {
        if (err) {
            return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
            var wsClosed = false;
            if (Array.isArray(decoded)) {
                req.decoded = decoded[0];
            } else {
                req.decoded = decoded;
            }
            client.subscribe('unfollow/' + req.decoded.username);
            console.log("subscribe('unfollow/' " + req.decoded.username);
            client.on('message', function (topic, msg) {
                console.log("got mqtt topic" + topic + " msg " + msg);
                if (topic == ('unfollow/' + req.decoded.username) && !wsClosed) {
                    ws.send(msg);
                }
            });
            ws.on('close', function () {
                console.log("unsubscribe('unfollow/' " + req.decoded.username);
                client.unsubscribe('unfollow/' + req.decoded.username);
                wsClosed = true;
            });
        }
    });
});


// START THE SERVER
// =============================================================================
app.listen(port);

console.log('Magic happens on port ' + port);
