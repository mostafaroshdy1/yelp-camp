
import express from 'express';
import { Campground } from '../models/campground.mjs'; // imports Campground model
import { catchAsync } from '../utils/catchAsync.mjs';
import { Review } from '../models/review.mjs';
export { router };
import { validateReview, isLoggedIn, isReviewAuthor } from '../middleware.mjs'
import * as reviews from '../controllers/reviews.mjs' // imports controllers of reviews

const router = express.Router({ mergeParams: true })




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//Delete Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))
