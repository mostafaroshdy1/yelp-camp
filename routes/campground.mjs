import express from 'express';
import { Campground } from '../models/campground.mjs'; // imports Campground model
import { catchAsync } from '../utils/catchAsync.mjs';
export { router };
import { isLoggedIn, isAuthor, validateCampground } from '../middleware.mjs'
import { Review } from '../models/review.mjs'; // imports Campground model



const router = express.Router()


// All campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index.ejs', { campgrounds });
}))

// Add new Campground form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs')
})

//  show page of specific campground
router.get('/:id', catchAsync(async (req, res) => {

    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: 'author'
    }).populate('author')
    const reviews = await Review.find({}).populate('author')
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show.ejs', { campground, reviews });
}))

//edit page of specific campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit.ejs', { campground });
}))

//Add new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground.id}`)
}))

//edit page of specific campground form
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground }).exec();
    req.flash('success', 'Successfully updated Campground!')
    res.redirect(`/campgrounds/${id}`);
}))

//deletes campgrounds
router.delete('/:id', isLoggedIn, isAuthor, async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground')
    res.redirect(`/campgrounds`)
})
