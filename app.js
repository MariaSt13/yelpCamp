const	express = require('express'),
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
		campgroundsRoutes = require('./routes/campgrounds');

mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false,  useCreateIndex: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


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

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

var port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => {
	console.log("YelpCamp server is running")
});