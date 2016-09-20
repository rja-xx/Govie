var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TheaterSchema   = new Schema({
    name: String,
    name_lowercase: String,
    lat: String,
    long: String,
    googleid: String,
    address: String
});

module.exports = mongoose.model('Theater', TheaterSchema);
