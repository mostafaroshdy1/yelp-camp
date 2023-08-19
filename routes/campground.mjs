import express from 'express';
import { Campground } from '../models/campground.mjs'; // imports Campground model
import { catchAsync } from '../utils/catchAsync.mjs';
import { campgroundSchema } from '../schema.mjs';
import { ExpressError } from '../utils/ExpressError.mjs';
export { router };
const router = express.Router()

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

// All campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index.ejs', { campgrounds });
}))

// Add new Campground form
router.get('/new', (req, res) => {
    res.render('campgrounds/new.ejs')
})

// the show page of specific campground
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show.ejs', { campground });
}))

//edit page of specific campground form
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit.ejs', { campground });
}))

//Add new campground
router.post('/', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground.id}`)
}))
//edit page of specific campground form
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }).exec();
    req.flash('success', 'Successfully updated Campground!')
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//deletes campgrounds
router.delete('/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground')

    res.redirect(`/campgrounds`)
})
