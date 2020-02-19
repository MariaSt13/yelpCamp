const	mongoose = require('mongoose'),
		Comment = require('./comment');

// Define campground schema
const campgroundSchema = new mongoose.Schema({
	name: String,
	price: Number,
	image: String,
	description: String,
	createdAt: {type:Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

// PRE-HOOK to remove campground with Comments on it
campgroundSchema.pre('remove', async function () {
	await Comment.deleteMany({
		_id: {
			$in: this.comments
		}
	});
});

module.exports = mongoose.model("Campground", campgroundSchema);
