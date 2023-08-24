import { campgroundSchema, reviewSchema } from './schema.mjs';
import { Campground } from './models/campground.mjs'; // imports Campground model
import { ExpressError } from './utils/ExpressError.mjs';
import { Review } from './models/review.mjs';



export { isLoggedIn, storeReturnTo, isAuthor, validateCampground, validateReview, isReviewAuthor }
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in')
        return res.redirect('/login')
    }
    next();
}

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// middlewares for authorization
const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next()
}

const isReviewAuthor = (async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
})


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