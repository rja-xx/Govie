// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var User     = require('./model/user');
var Config   = require('./config')
var uuid         = require('uuid');
var mongoose   = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
mongoose.connect(Config.database);
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('superSecret', Config.secret);

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================

app.post('/addUser', function(req, res){
		var user = new User();
		user.alias = req.body.alias;
		user.username = req.body.username;
		user.salt = uuid.v4();
		user.password = req.body.password;
		user.password = crypto.createHmac('sha1', user.salt).update(user.password).digest('hex');

		user.save(function(err) {
			if (err){
				res.send(err);
			}else{
				var token = jwt.sign(user, app.get('superSecret'), {
					 expiresInMinutes: 1
				 });
				res.status(200).json({ token: token });
			}
		})
});

app.post('/authenticate', function(req, res){
	var password = req.body.password;
		User.find({username: req.body.username}, function(err, user){
			if(user[0].password === crypto.createHmac('sha1', user[0].salt).update(password).digest('hex')){
				var token = jwt.sign(user, app.get('superSecret'), {
					 expiresInMinutes: 1
				 });
				res.status(200).json({ token: token });

			}else{
				res.status(403).json({ message: "invalid login" });
			}
		});
	});


var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
	// do logging
	console.log('got request');
	next(); // make sure we go to the next routes and don't stop here
});

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
				console.log(decoded.username);
					console.log(decoded.exp);
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
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

router.route('/users').get(function(req, res) {
	User.find(function(err, users) {
		if (err)
		res.send(err);

		res.json(users);
	});
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
