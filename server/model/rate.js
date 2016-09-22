var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RateSchema   = new Schema({
    username: String,
    movie: String,
    posterUrl: String,
    imgUrl: String,
    theater: String,
    friends: [String],
    likes: [String],
    note: String,
    rate: Number,
    time : { type : Date, default: Date.now }
});

module.exports = mongoose.model('Rate', RateSchema);
