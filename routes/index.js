const express = require('express'),
	passport = require('passport'),
	router = express.Router(),
	User = require("../models/user"),
	Campground = require("../models/campground"),
	async = require('async'),
	nodemailer = require('nodemailer'),
	crypto = require('crypto');

// Index route
router.get("/", (req, res) => {
	res.render("landing")
});

// Show signUp
router.get("/signup", (req, res) => {
	res.render("signup", { active: "signup" });
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
			let error = err.message;
			if (err.code == '11000') {
				error = "A user with that email already exists.";
			}
			console.log(err);
			return res.render("signup", { error: error });
		}
	})
});

// Show login
router.get("/login", (req, res) => {
	res.render("login", { active: "login" });
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
	var returnTo = req.session.returnTo ? req.session.returnTo : "/campgrounds";
	delete req.session.returnTo;
	res.redirect(returnTo);
});

// Show forgot password route
router.get("/forgot", (req, res) => {
	res.render('forgot')
});

// Forgot password route
router.post("/forgot", (req, res, next) => {
	async.waterfall([
		// create token
		done => {
			crypto.randomBytes(20, (err, buf) => {
				const token = buf.toString('hex');
				done(err, token);
			})
		},
		(token, done) => {
			// check that a user with that email exists.
			User.findOne({ email: req.body.email }, (err, user) => {
				if (!user) {
					req.flash("error", "No account with that email exists.");
					res.redirect("/forgot");
				}
				// set token for user
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // valid for 1 hour.

				// save user
				user.save(err => {
					done(err, token, user);
				})
			})
		},
		// send reset email
		(token, user, done) => {
			const transport = nodemailer.createTransport({
				host: 'smtp.sendgrid.net',
				port: 465,
				auth: {
					user: 'apikey',
					pass: process.env.APIKEY
				},
				tls: {
					rejectUnauthorized: false
				}

			});
			const mailOptions = {
				to: user.email,
				from: 'yelpCampNoReplay@yelpCamp.com',
				subject: "YelpCamp Password Reset",
				text: "Hi, " + user.username + "\nTo reset your password please click the following link:\n" +
					"http://" + req.headers.host + "/reset/" + token + "\n\n" +
					"If you don't want to reset your password, you can ignore this message – someone probably typed in your email address by mistake."
			};
			transport.sendMail(mailOptions, err => {
				console.log("mail sent");
				req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
				done(err, 'done');
			})
		}
	], err => {
		if (err) return next(err);
		res.redirect('/forgot');
	})

})

// Show reset password route
router.get("/reset/:token", async (req, res) => {
	try {
		let user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
		if (!user) {
			req.flash("error", "The password reset token is invalid or has expired. Please request a new one.")
			return res.render('/forgot');
		} else {
			res.render('reset', { token: req.params.token });
		}
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong.");
		res.redirect("/campgrounds");
	}
})

// Reset password route
router.post("/reset/:token", (req, res) => {
	async.waterfall([
		done => {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
				if (!user) {
					req.flash("error", "The password reset token is invalid or has expired. Please request a new one.")
					return res.redirect('back');
				}
				if (req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, err => {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(err => {
							req.logIn(user, err => {
								done(err, user);
							})
						})
					})
				} else {
					req.flash("error", "Passwords do not match.")
					res.redirect('back');
				}
			})
		},
		(user, done) => {
			const transport = nodemailer.createTransport({
				host: 'smtp.sendgrid.net',
				port: 465,
				auth: {
					user: 'apikey',
					pass: process.env.APIKEY
				},
				tls: {
					rejectUnauthorized: false
				}
			});
			const mailOptions = {
				to: user.email,
				from: 'yelpCampNoReplay@yelpCamp.com',
				subject: "Your password has been changed.",
				text: "Hi, " + user.username + "\n\nThis is a confirmation that the password for your account has been changed."
			};
			transport.sendMail(mailOptions, err => {
				console.log("mail sent");
				req.flash("success", "Your password has been changed.");
				done(err);
			})
		}
	], err => {
		res.redirect('/campgrounds')
	})
})

module.exports = router;