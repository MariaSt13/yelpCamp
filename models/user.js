const	mongoose = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	firstname: String,
	lastname: String,
	email: {type: String, unique:true},
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
