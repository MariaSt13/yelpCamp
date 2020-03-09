const mongoose = require('mongoose');

// Define notification schema
const notificationSchema = new mongoose.Schema({
    username: String,
    campgroundSlug: String,
    text: String,
    isRead: {type: Boolean, default:false},
    createdAt:{type:Date, default: Date.now}
});

notificationSchema.pre('remove', async function(next)  {
	try {
		const user = await this.model('User').findOne({ notifications: this._id })
		user.notifications.pull(this._id)
		user.save()
		next();
	} catch (err) {
		next(err);
	}
})

module.exports = mongoose.model("Notification", notificationSchema);
