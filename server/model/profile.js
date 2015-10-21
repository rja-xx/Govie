var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProfileSchema   = new Schema({
    username: String,
    followers: Number,
    following: Number,
    movies: Number,
});

module.exports = mongoose.model('Profile', ProfileSchema);
