var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProfileSchema   = new Schema({
    username: String,
    followers: [String],
    follows: [String],
    movies: Number
});

module.exports = mongoose.model('Profile', ProfileSchema);
