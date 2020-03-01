const mongoose = require('mongoose');

// Define comment schema
const commentSchema = new mongoose.Schema({
	text: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

commentSchema.pre('remove', async function(next)  {
	try {
		const campground = await this.model('Campground').findOne({ comments: this._id })
		campground.comments.pull(this._id)
		campground.save()
		next();
	} catch (err) {
		next(err);
	}
})
module.exports = mongoose.model("Comment", commentSchema);
