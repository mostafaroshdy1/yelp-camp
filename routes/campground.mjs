import express from 'express';
import { Campground } from '../models/campground.mjs'; // imports Campground model
import { catchAsync } from '../utils/catchAsync.mjs';
export { router };
import { isLoggedIn, isAuthor, validateCampground } from '../middleware.mjs'
import { Review } from '../models/review.mjs'; // imports Campground model
import * as campgrounds from '../controllers/campgrounds.mjs' // import from controllers


const router = express.Router()


router.route('/')
    // All campgrounds
    .get(catchAsync(campgrounds.index))
    //Add new campground
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// Add new Campground form
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //  show page of specific campground
    .get(catchAsync(campgrounds.showCampground))
    //edit page of specific campground form
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    //deletes a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))




//edit page of specific campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
