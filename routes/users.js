const express = require('express'),
    router = express.Router(),
    User = require("../models/user"),
    Campground = require("../models/campground"),
    middleware = require("../middleware/index");

// User page route
router.get("/:id", async (req, res) => {
	try {
		let user = await User.findById(req.params.id).populate("followers").exec();
		// Check that a user with that id exists.
		if (user) {
			let campgrounds = await Campground.find().where('author').equals(user);
			return res.render("users/show", { user: user, campgrounds: campgrounds })
		}
		req.flash("error", "Oops, Something went wrong.");
		res.redirect("/campgrounds");
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops, Something went wrong.");
		res.redirect("/campgrounds");
	}
})

router.get("/:id/follow",middleware.isLoggedIn, async(req,res)=> {
    try{
        let user = await User.findById(req.params.id).populate("followers").exec();
        user.followers.push(req.user);
        await user.save();
        req.flash("success", "Successfully followed " + user.username + "!");
        res.redirect("/users/" + req.params.id);
    } catch(err) {
        console.log(err);
		req.flash("error", "Oops, Something went wrong.");
		res.redirect("/campgrounds");
    }
});

router.get("/:id/unfollow",middleware.isLoggedIn, async(req,res)=> {
    try{
        let user = await User.findById(req.params.id).populate("followers").exec();
        user.followers.pull(req.user);
        await user.save();
        req.flash("success", "Successfully unfollowed " + user.username);
        res.redirect("/users/" + req.params.id);
    } catch(err) {
        console.log(err);
		req.flash("error", "Oops, Something went wrong.");
		res.redirect("/campgrounds");
    }
});

 module.exports = router;