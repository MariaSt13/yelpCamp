const	express = require('express'),
		router = express.Router(),
		Campground = require("../models/campground"),
		middleware = require('../middleware');

// Index route
router.get("/", (req, res) => {
	Campground.find({}, (err, campgrounds) => {
		if (!err) {
			req.session.returnTo = req.originalUrl;
			res.render("campgrounds/index", { campgrounds: campgrounds , active:"campgrounds"});
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("/campgrounds")
		}
	});
});

// Create route
router.post("/", middleware.isLoggedIn, (req, res) => {
	req.body.campground.author = {
		id: req.user._id,
		username: req.user.username
	};

	Campground.create(req.body.campground, (err, newCampground) => {
		if (!err) {
			req.flash("success", "Campground created");
			res.redirect("/campgrounds");
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("back");
		}
	});
});

// New route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// Show route
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if (!err && foundCampground) {
			req.session.returnTo = req.originalUrl;
			res.render("campgrounds/show", { campground: foundCampground })
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("back");
		}
	});
});

// Edit route
router.get("/:id/edit", middleware.isLoggedIn, middleware.isCampgroundOwner, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (!err && campground) {
			res.render("campgrounds/edit", { campground: campground });
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("back");
		}
	})
});

// Update route
router.put("/:id", middleware.isLoggedIn, middleware.isCampgroundOwner, (req, res) => {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
		if (!err) {
			req.flash("success", "Campground updated");
			res.redirect("/campgrounds/" + req.params.id);
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("/campgrounds")
		}
	})
});

// Destroy route
router.delete("/:id", middleware.isLoggedIn, middleware.isCampgroundOwner, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (!err) {
			campground.remove();
			req.flash("success", "Campground deleted");
			res.redirect("/campgrounds");
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("/campgrounds");
		}
	})
});

module.exports = router;