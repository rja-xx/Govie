var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    alias: String,
    username: String,
    password: String,
    salt: String,
    token: String
});

module.exports = mongoose.model('User', UserSchema);
