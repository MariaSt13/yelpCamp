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
router.get("/:slug", (req, res) => {
	Campground.findOne({slug: req.params.slug}).populate("comments").exec((err, foundCampground) => {
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
router.get("/:slug/edit", middleware.isLoggedIn, middleware.isCampgroundOwner, (req, res) => {
	Campground.findOne({slug: req.params.slug}, (err, campground) => {
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
router.put("/:slug", middleware.isLoggedIn, middleware.isCampgroundOwner, (req, res) => {
	Campground.findOne({slug: req.params.slug}, (err, campground) => {
		if (!err) {
			campground.name = req.body.campground.name;
			campground.price  = req.body.campground.price;
			campground.image = req.body.campground.image;
			campground.description = req.body.campground.description;
			campground.save(err => {
				if(!err) {
					req.flash("success", "Campground updated");
					res.redirect("/campgrounds/" + campground.slug);	
				} else {
					console.log(err);
					req.flash("error", "Oops, Something went wrong");
					res.redirect("/campgrounds")
				}
			})
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong");
			res.redirect("/campgrounds")
		}
	})
});

// Destroy route
router.delete("/:slug", middleware.isLoggedIn, middleware.isCampgroundOwner, (req, res) => {
	Campground.findOne({slug: req.params.slug}, (err, campground) => {
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