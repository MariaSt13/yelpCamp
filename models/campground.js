const	mongoose = require('mongoose'),
		Comment = require('./comment');

// Define campground schema
const campgroundSchema = new mongoose.Schema({
	name: {
		type: String,
		required:"Campground name cannot be blank."
	},
	price: Number,
	image: String,
	description: String,
	createdAt: {type:Date, default: Date.now},
	slug: {
		type:String,
		unique:true
	},
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


campgroundSchema.pre('save', async function(next) {
	try{
		if(this.isNew || this.isModified('name')) {
			this.slug = await generateUniqueSlug(this._id, this.name)
		}
		next();
	}catch(err) {
		next(err);
	}
})
const Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;

async function generateUniqueSlug(id, name, slug) {
	if(!slug) {
		slug = createSlug(name);
	}
	const campground = await Campground.findOne({slug: slug});
	if(!campground || campground._id.equals(id)) {
		return slug;
	}
	const newSlug = createSlug(name);
	return await generateUniqueSlug(id, name, newSlug)
}

function createSlug(name) {
	var slug = name.toString().toLowerCase()
	.replace(/\s+/g, '-')        // Replace spaces with -
	.replace(/[^\w\-]+/g, '')    // Remove all non-word chars
	.replace(/\-\-+/g, '-')      // Replace multiple - with single -
	.replace(/^-+/, '')          // Trim - from start of text
	.replace(/-+$/, '')          // Trim - from end of text
	.substring(0, 75);           // Trim at 75 characters
  return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}