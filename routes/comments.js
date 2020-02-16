const	express = require('express'),
		router = express.Router({ mergeParams: true }),
		Campground = require("../models/campground"),
		Comment = require("../models/comment"),
		middleware = require('../middleware');

// Comment New route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
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
		let campground = await Campground.findById(req.params.id);
		let comment = await Comment.create(req.body.comment);
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		comment.save();
		campground.comments.push(comment);
		campground.save();
		req.flash("success", "Comment created");
		res.redirect("/campgrounds/" + req.params.id);
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("back");
	}
});

// Edit comment route
router.get("/:comment_id/edit", middleware.isLoggedIn, middleware.isCommentOwner, async (req, res) => {
	try {
		let campground = await Campground.findById(req.params.id);
		let comment = await Comment.findById(req.params.comment_id);
		if (campground && comment) {
			res.render("comments/edit", { comment: comment, campground_id: req.params.id });
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
			res.redirect("/campgrounds/" + req.params.id);
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("back");
		}
	})
});

// Destroy comment route
router.delete("/:comment_id", middleware.isLoggedIn, middleware.isCommentOwner, (req, res) => {
	Comment.findByIdAndDelete(req.params.comment_id, (err) => {
		if (!err) {
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("back");
		}
	})
})


module.exports = router;