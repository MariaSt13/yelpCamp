const	express = require('express'),
		passport = require('passport'),
		router = express.Router(),
		User = require("../models/user");

// Index route
router.get("/", (req, res) => {
	res.render("landing")
});

// Show signUp
router.get("/signup", (req, res) => {
	res.render("signup");
});

// Create user
router.post("/signup", (req, res) => {
	const newUser = new User({ username: req.body.username });
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
	res.render("login");
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

module.exports = router;