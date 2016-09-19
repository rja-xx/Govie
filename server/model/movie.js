var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MovieSchema  = new Schema({
    title: String,
    title_lowercase: String,
    tmdbId: String,
    posterUrl: String,
    backdropUrl: String,
    popularity: Number
});

module.exports = mongoose.model('Movie', MovieSchema);
