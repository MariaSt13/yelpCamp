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
	resetPasswordExpires: Date,
	notifications: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Notification'
	}],
	followers: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
