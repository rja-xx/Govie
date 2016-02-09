var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MovieSearchSchema  = new Schema({
    sfTitle: String,
    result: Number
});

module.exports = mongoose.model('MovieSearch', MovieSearchSchema);
