import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
// import { } from 'ejs'; // requied ejs for templating 
// import { Campground } from './models/campground.mjs' // imports Campground model
import { seedDB } from '/mnt/internal/coding/Studying/YelpCamp/mine/seeds/index.js' // To seed our data base (deletes current DB)
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import { ExpressError } from './utils/ExpressError.mjs'
// import { catchAsync } from './utils/catchAsync.mjs'
// import { campgroundSchema } from './schema.mjs'
// import { reviewSchema } from './schema.mjs'
// import { Review } from './models/review.mjs'
import { router as campgroundRoutes } from './routes/campground.mjs';
import { router as reviewRoutes } from './routes/reviews.mjs'
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { User } from './models/user.mjs'
import { router as userRoutes } from './routes/users.mjs'


// seedDB(); // for seeding the DB

// Establish the DB connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(console.log('dataBase Connected'));
const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'))// override with POST having ?_method=DELETE
// sets the view engine to ejs
app.use(express.static('public'));


const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))

//Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(flash());
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
//Home Page


app.use((req, res, next) => {

    res.locals.currentUser = req.user; // to have the req.user on every template
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})
app.get('/', (req, res) => {
    res.render('home.ejs');
})

//  Register route
app.use('/', userRoutes)

//  All campgrounds
app.use('/campgrounds', campgroundRoutes)

//  Review routes
app.use('/campgrounds/:id/reviews', reviewRoutes)




//  Any Invalid routes
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong"
    res.status(statusCode).render('error.ejs', { err })
})

app.listen(3000, () => {
    console.log('Connected to Port 3000!')
})

