
import express from 'express';
import { Campground } from '../models/campground.mjs'; // imports Campground model
import { catchAsync } from '../utils/catchAsync.mjs';
import { Review } from '../models/review.mjs';
export { router };
import { validateReview, isLoggedIn, isReviewAuthor } from '../middleware.mjs'

const router = express.Router({ mergeParams: true })







router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const { body, rating } = req.body.review
    const review = new Review({ body, rating })
    campground.reviews.push(review)
    review.author = req.user._id
    await campground.save();
    await review.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground.id}`)
}))

//Delete Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))
