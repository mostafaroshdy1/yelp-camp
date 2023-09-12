process.env.NODE_ENV = "development"
import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from "helmet";
import cookieParser from 'cookie-parser';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// import { } from 'ejs'; // requied ejs for templating 
// import { Campground } from './models/campground.mjs' // imports Campground model
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

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'


// Establish the DB connection
mongoose.connect(dbUrl)
    .then(console.log('dataBase Connected'))

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'))// override with POST having ?_method=DELETE
// sets the view engine to ejs
app.use(express.static('public'));
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SEESSION_PASSWORD
    }
});
store.on('error', function (e) {
    console.log('SESSION STORE ERROR!', e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.SEESSION_PASSWORD,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

//Passport
app.use(cookieParser())
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(function (user, done) { done(null, user) });
passport.deserializeUser(function (user, done) { done(null, user) });


//Passport-google auth
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://yelpcampoo.onrender.com/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id, username: profile.displayName, email: profile.emails[0].value }, function (err, user) {
            return cb(err, user);
        });
    }
));




app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://fonts.googleapis.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",


];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlmq1xbtj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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

