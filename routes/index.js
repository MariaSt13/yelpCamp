const	express = require('express'),
		passport = require('passport'),
		router = express.Router(),
		User = require("../models/user"),
		Campground = require("../models/campground");

// Index route
router.get("/", (req, res) => {
	res.render("landing")
});

// Show signUp
router.get("/signup", (req, res) => {
	res.render("signup", {active: "signup"});
});

// Create user
router.post("/signup", (req, res) => {
	const newUser = new User({
		 username: req.body.username,
		 email: req.body.email,
		 firstname: req.body.firstname,
		 lastname: req.body.lastname
		 });
	User.register(newUser, req.body.password, (err, user) => {
		if (!err) {
			passport.authenticate("local")(req, res, () => {
				req.flash("success", "Welcome to YelpCamp " + user.username + "!");
				res.redirect("/campgrounds");
			})
		} else {
			console.log(err);
			return res.render("signup", { error: err.message });
		}
	})
});

// Show login
router.get("/login", (req, res) => {
	res.render("login", {active:"login"});
});

// Log in user
router.post("/login",
	passport.authenticate("local",
		{
			failureRedirect: "/login",
			failureFlash: true
		}), (req, res) => {
			var returnTo = req.session.returnTo ? req.session.returnTo : "/campgrounds";
			delete req.session.returnTo;
			req.flash("success", "Welcome back " + req.user.username + "!")
			res.redirect(returnTo);
		}
);

// Logout route
router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/campgrounds");
});

// User page route
router.get("/users/:id", (req,res)=> {
	User.findById(req.params.id, async (err, user)=> {
		if(!err) {
			let campgrounds = await Campground.find().where('author.id').equals(user.id);
			res.render("users/show", {user: user, campgrounds:campgrounds})
		} else {
			console.log(err);
			req.flash("error", "Oops, Something went wrong.");
			res.redirect("/campgrounds");
		}
	})
})
module.exports = router;