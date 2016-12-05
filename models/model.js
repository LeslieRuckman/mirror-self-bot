var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html
// define a meal
var ChatSchema = new Schema({
	type: String, // response from twilio
	dateAdded : { type: Date, default: Date.now },
});


// export model
module.exports = mongoose.model('Chat',MealSchema);
