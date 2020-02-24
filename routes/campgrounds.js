const express = require('express'),
	router = express.Router(),
	multer = require('multer'),
	cloudinary = require('cloudinary'),
	Campground = require("../models/campground"),
	middleware = require('../middleware');

const storage = multer.diskStorage({
	filename: (req, file, callback) => {
		callback(null, Date.now() + file.originalname);
	}
});

const imageFilter = (req, file, cb) => {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};

cloudinary.config({
	cloud_name: 'yelp-camp-maria',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: storage, fileFilter: imageFilter });


// Index route
router.get("/", async (req, res) => {
	try {
		const campgrounds = await Campground.find({});
		req.session.returnTo = req.originalUrl;
		res.render("campgrounds/index", { campgrounds: campgrounds, active: "campgrounds" });
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("/campgrounds")
	}
});

// Create route
router.post("/", middleware.isLoggedIn, upload.single('imageFile'), async (req, res) => {
	try {
		if (req.file) {
			const result = await cloudinary.v2.uploader.upload(req.file.path);
			req.body.campground.image = result.secure_url;
			req.body.campground.imageId = result.public_id;
		}
		else {
			req.body.campground.image = req.body.imageUrl;
		}
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		};
		await Campground.create(req.body.campground);
		req.flash("success", "Campground created");
		res.redirect("/campgrounds");
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("back");
	}
});

// New route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// Show route
router.get("/:slug", (req, res) => {
	Campground.findOne({ slug: req.params.slug }).populate("comments").exec((err, foundCampground) => {
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
	Campground.findOne({ slug: req.params.slug }, (err, campground) => {
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
router.put("/:slug", middleware.isLoggedIn, middleware.isCampgroundOwner, upload.single('imageFile'), async (req, res) => {
	try {
		const campground = await Campground.findOne({ slug: req.params.slug });
		campground.name = req.body.name;
		campground.price = req.body.price;
		campground.description = req.body.description;
		if (req.file) {
			campground.imageId ? await cloudinary.v2.uploader.destroy(campground.imageId) : "";
			const result = await cloudinary.v2.uploader.upload(req.file.path);
			campground.image = result.secure_url;
			campground.imageId = result.public_id;
		} else if (req.body.imageUrl) {
			campground.imageId ? await cloudinary.v2.uploader.destroy(campground.imageId) : "";
			campground.imageId = null;
			campground.image = req.body.imageUrl;
		}
		await campground.save();
		req.flash("success", "Campground updated");
		res.redirect("/campgrounds/" + campground.slug);
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("/campgrounds")
	}
});

// Destroy route
router.delete("/:slug", middleware.isLoggedIn, middleware.isCampgroundOwner, async (req, res) => {
	try {
		const campground = await Campground.findOne({ slug: req.params.slug });
		campground.imageId ? await cloudinary.v2.uploader.destroy(campground.imageId) : "";
		await campground.remove();
		req.flash("success", "Campground deleted");
		res.redirect("/campgrounds");
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong");
		res.redirect("/campgrounds");
	}
});

module.exports = router;