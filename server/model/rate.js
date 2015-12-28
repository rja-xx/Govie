var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RateSchema   = new Schema({
    username: String,
    movie: [String],
    friends: [String],
    note: String,
    rate: Number
});

module.exports = mongoose.model('Rate', RateSchema);
