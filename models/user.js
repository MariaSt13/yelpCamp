const	mongoose = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	firstname: String,
	lastname: String,
	email: String
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
