const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	methodOverride = require('method-override'),
	flash = require('connect-flash'),
	uuid = require('uuid/v4'),
	User = require('./models/user'),
	indexRoutes = require('./routes/index'),
	commentsRoutes = require('./routes/comments'),
	campgroundsRoutes = require('./routes/campgrounds'),
	notificationsRoutes = require('./routes/notifications'),
	usersRoutes = require('./routes/users');

require('dotenv').config();
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

// Passport config

app.use(session({
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
	res.locals.currentUser = req.user;
	if (req.user) {
		try {
			const user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec();
			res.locals.notifications = user.notifications.sort((a,b)=>b.createdAt - a.createdAt);
		} catch(err) {
			console.log(err);
		}
	}
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:slug/comments", commentsRoutes);
app.use("/notifications",notificationsRoutes)
app.use("/users", usersRoutes)

var port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => {
	console.log("YelpCamp server is running")
});