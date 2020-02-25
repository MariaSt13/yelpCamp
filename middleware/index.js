const	Campground = require("../models/campground"),
		Comment = require("../models/comment");
		
const middlewares = {};

// Checks if the user is logged in
middlewares.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	if(req.method === "GET") {
		req.session.returnTo = req.originalUrl;
	}
	req.flash("error", "Please log in first");
	res.redirect("/login");
};

// Checks that the user owns the comment
middlewares.isCommentOwner = (req, res, next) => {
	Comment.findById(req.params.comment_id, (err, comment) => {
		if (!err && comment) {
			if (comment.author.id.equals(req.user._id)) {
				return next();
			} else {
				req.flash("error", "You don't have permission to do that.");
				res.redirect("back");
			}
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong.");
			res.redirect("back");
		}
	});
}

// Checks that the user owns the campground
middlewares.isCampgroundOwner = (req, res, next) => {
	Campground.findOne({slug: req.params.slug}, (err, campground) => {
		if (!err && campground) {
			if (campground.author.id.equals(req.user._id)) {
				return next();
			} else {
				req.flash("error", "You don't have permission to do that.");
				res.redirect("back");
			}
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong.");
			res.redirect("back");
		}
	});
}

module.exports = middlewares;