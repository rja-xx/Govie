var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProfileSchema   = new Schema({
    username: String,
    followers: [String],
    following: [String],
    movies: [String],
});

module.exports = mongoose.model('Profile', ProfileSchema);
