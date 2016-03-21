var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    alias: String,
    username: String,
    password: String,
    twitterUserId: String,
    twitterToken: String,
    twitterSecretToken: String,
    salt: String,
    token: String
});

module.exports = mongoose.model('User', UserSchema);
