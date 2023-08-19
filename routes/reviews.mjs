
import express from 'express';
import { Campground } from '../models/campground.mjs'; // imports Campground model
import { catchAsync } from '../utils/catchAsync.mjs';
import { Review } from '../models/review.mjs';
import { reviewSchema } from '../schema.mjs'
import { ExpressError } from '../utils/ExpressError.mjs'
export { router };

const router = express.Router({ mergeParams: true })

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

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const { body, rating } = req.body.review
    const review = new Review({ body, rating })
    campground.reviews.push(review)
    await campground.save();
    await review.save();
    req.flash('success', 'Created new review!')
    // res.send(campground.reviews)
    res.redirect(`/campgrounds/${campground.id}`)
}))
//Delete Review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))
