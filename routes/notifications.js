const express = require('express'),
    router = express.Router(),
    User = require("../models/user"),
    Notification = require("../models/notification"),
    middleware = require('../middleware');

// Show all notifications route
router.get("/", middleware.isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.user._id).populate({ path: "notifications", options: { sort: { createdAt: -1 } } }).exec();
        res.render('notifications/index', { allNotifications: user.notifications });
    } catch (err) {
        console.log(err);
        req.flash("error", "Oops, Something went wrong.");
        res.redirect("/campgrounds");
    }
})

// Handle notification route
router.get("/:id", async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        await notification.save();
        res.redirect("/campgrounds/" + notification.campgroundSlug)
    } catch (err) {
        console.log(err);
        req.flash("error", "Oops, Something went wrong.");
        res.redirect("/campgrounds");
    }
})

// Delete notification route
router.delete("/:id", middleware.isLoggedIn, async (req, res) => {
    try {
        const notification =  await Notification.findById(req.params.id);
        await notification.remove();
        req.flash("success", "Notification deleted");
    } catch (err) {
        console.log(err);
        req.flash("error", "Oops, Something went wrong.");
    } finally {
        res.redirect("/notifications");
    }
})

module.exports = router;