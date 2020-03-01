const Campground = require("../models/campground"),
	Comment = require("../models/comment");

const middlewares = {};

// Checks if the user is logged in
middlewares.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	if (req.method === "GET") {
		req.session.returnTo = req.originalUrl;
	}
	req.flash("error", "Please log in first");
	res.redirect("/login");
};

// Checks that the user owns the comment
middlewares.isCommentOwner = async (req, res, next) => {
	try {
		let comment = await Comment.findById(req.params.comment_id).populate('author');
		if (comment) {
			if (comment.author._id.equals(req.user._id)) {
				return next();
			} else {
				req.flash("error", "You don't have permission to do that.");
				res.redirect("back");
			}
		}
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong.");
		res.redirect("back");
	}
}

// Checks that the user owns the campground
middlewares.isCampgroundOwner = async (req, res, next) => {
	try {
		let campground = await Campground.findOne({ slug: req.params.slug });
		if (campground) {
			if (campground.author._id.equals(req.user._id)) {
				return next();
			} else {
				req.flash("error", "You don't have permission to do that.");
				res.redirect("back");
			}
		}
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong.");
		res.redirect("back");
	}
}

module.exports = middlewares;