import express from 'express';
import mongoose from 'mongoose';
import { } from 'ejs'; // requied ejs for templating 
import { Campground } from './models/campground.mjs' // imports Campground model
import { seedDB } from '/mnt/internal/coding/Studying/YelpCamp/mine/seeds/index.js' // To seed our data base (deletes current DB)
import methodOverride from 'method-override';
import engine from 'ejs-mate';
import { ExpressError } from './utils/ExpressError.mjs'
import { catchAsync } from './utils/catchAsync.mjs'
import { campgroundSchema } from './schema.mjs'
import { reviewSchema } from './schema.mjs'
import { Review } from './models/review.mjs'


const validateCampground = (req, res, next) => {
    // campgroundSchema(); //imported from schema.mjs
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    // reviewSchema(); //imported from schema.mjs
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// Establish the DB connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(console.log('dataBase Connected'));
const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'))// override with POST having ?_method=DELETE
// sets the view engine to ejs
app.set('engine view', 'ejs')
app.engine('ejs', engine)

//Home Page
app.get('/', (req, res) => {
    res.render('home.ejs');
})

// All campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index.ejs', { campgrounds });
}))

// Add new Campground form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs')
})

// the show page of specific campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show.ejs', { campground });
}))

//edit page of specific campground form
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit.ejs', { campground });
}))

//Add new campground
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`)
}))


// Review routes
//Adding review to campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const { body, rating } = req.body.review
    const review = new Review({ body, rating })
    campground.reviews.push(review)
    await campground.save();
    await review.save();
    // res.send(campground.reviews)
    res.redirect(`/campgrounds/${campground.id}`)
}))
//Delete Review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


//edit page of specific campground form
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }).exec();
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//deletes campgrounds
app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect(`/campgrounds`)
})


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

