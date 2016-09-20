var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProfileSchema   = new Schema({
    username: String,
    username_lowercase: String,
    alias: String,
    alias_lowercase: String,
    followers: [String],
    follows: [String],
    movies: Number,
    imgUrl: String
});

module.exports = mongoose.model('Profile', ProfileSchema);
