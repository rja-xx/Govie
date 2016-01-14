var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MovieSchema  = new Schema({
    name: String,
    genre: String,
    length: String,
    imageUrl: String
});

module.exports = mongoose.model('Movie', MovieSchema);
