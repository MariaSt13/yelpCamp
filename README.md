# yelpCamp
A Node.js web application project from the Udemy course - The Web Developer Bootcamp by Colt Steele

To see the app in action, click [here](https://salty-oasis-67330.herokuapp.com/).

## Features

* Authentication:
  
  * User login with username and password.

* Authorization:

  * A user cannot manage posts, comments, and likes without being authenticated.
  
  * A user cannot follow another user without being authenticated.

  * A user cannot edit or delete posts and comments created by other users.

* Manage campground posts:

  * Create, edit and delete posts and comments.

  * Upload campground photos.
  
  * Like campgrounds.

* Manage user account:

  * Password reset via email confirmation.

* In-app notification system:

  * Users get a notification when someone likes their campground.
  
  * Users get a notification when someone comments on their campground.
  
  * Users can follow other users and get a notification when they upload a new campground.
  
* Flash messages responding to users' interaction with the app.

* Responsive web design.

 
> This app contains API secrets and passwords that have been hidden deliberately, so the app cannot be run with its features on your local machine.

## Built with

### Front-end

* [ejs](http://ejs.co/)
* [Bootstrap](https://getbootstrap.com/docs/3.3/)

### Back-end

* [Node.js](https://nodejs.org/en/)
* [express](https://expressjs.com/)
* [mongoDB](https://www.mongodb.com/)
* [mongoose](http://mongoosejs.com/)
* [passport](http://www.passportjs.org/)
* [passport-local](https://github.com/jaredhanson/passport-local#passport-local)
* [express-session](https://github.com/expressjs/session#express-session)
* [method-override](https://github.com/expressjs/method-override#method-override)
* [nodemailer](https://nodemailer.com/about/)
* [moment](https://momentjs.com/)
* [cloudinary](https://cloudinary.com/)
* [connect-flash](https://github.com/jaredhanson/connect-flash#connect-flash)
* [async](http://caolan.github.io/async/)

### Platforms

* [Cloudinary](https://cloudinary.com/)
* [Heroku](https://www.heroku.com/)
