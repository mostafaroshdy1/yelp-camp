import express from 'express';
import { Campground } from '../models/campground.mjs'; // imports Campground model
import { catchAsync } from '../utils/catchAsync.mjs';
export { router };
import { isLoggedIn, isAuthor, validateCampground } from '../middleware.mjs'
import { Review } from '../models/review.mjs'; // imports Campground model
import * as campgrounds from '../controllers/campgrounds.mjs' // import from controllers
import multer from 'multer';
import { storage } from '../cloudinary/index.mjs';
const upload = multer({ storage })


const router = express.Router()


router.route('/')
    // All campgrounds
    .get(catchAsync(campgrounds.index))
    //Add new campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


// Add new Campground form
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //  show page of specific campground
    .get(catchAsync(campgrounds.showCampground))
    //edit page of specific campground form
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //deletes a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))




//edit page of specific campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
