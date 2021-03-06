const express = require('express'),
	router = express.Router({ mergeParams: true }),
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	Notification = require("../models/notification"),
	middleware = require('../middleware');

// Comment New route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	Campground.findOne({ slug: req.params.slug }, (err, campground) => {
		if (!err && campground) {
			res.render("comments/new", { campground: campground });
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong.");
			res.redirect("back");
		}
	});
});

// Comment Create route
router.post("/", middleware.isLoggedIn, async (req, res) => {
	try {
		let campground = await Campground.findOne({ slug: req.params.slug }).populate('author').exec();
		let comment = await Comment.create(req.body.comment);
		comment.author = req.user;
		comment.save();
		campground.comments.push(comment);
		campground.save();
		// create notification if the author of the comment is not the author of the campground
		if (!comment.author._id.equals(campground.author._id)) {
			let newNotification = {
				username: req.user.username,
				campgroundSlug: req.params.slug,
				text: " just commented on your campground \"" + campground.name + "\""
			}
			let notification = await Notification.create(newNotification);
			campground.author.notifications.push(notification);
			campground.author.save();
		}
		req.flash("success", "Comment created");
		res.redirect("/campgrounds/" + req.params.slug);
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("back");
	}
});

// Edit comment route
router.get("/:comment_id/edit", middleware.isLoggedIn, middleware.isCommentOwner, async (req, res) => {
	try {
		let campground = await Campground.findOne({ slug: req.params.slug });
		let comment = await Comment.findById(req.params.comment_id);
		if (campground && comment) {
			res.render("comments/edit", { comment: comment, campground_slug: req.params.slug });
		} else {
			req.flash("error", "Oops, Something went wrong");
			res.redirect("back");
		}
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("back");
	}
})

// Update comment route
router.put("/:comment_id", middleware.isLoggedIn, middleware.isCommentOwner, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment) => {
		if (!err) {
			req.flash("success", "Comment updated");
			res.redirect("/campgrounds/" + req.params.slug);
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("back");
		}
	})
});

// Destroy comment route
router.delete("/:comment_id", middleware.isLoggedIn, middleware.isCommentOwner, async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.comment_id);
		await comment.remove()
		req.flash("success", "Comment deleted");
		res.redirect("/campgrounds/" + req.params.slug);
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("back");
	}
})


module.exports = router;