import { Campground } from '../models/campground.mjs'; // imports Campground model
import { Review } from '../models/review.mjs'; // imports Campground model


export { index, renderNewForm, createCampground, showCampground, renderEditForm, updateCampground, deleteCampground }

const index = async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index.ejs', { campgrounds });
}

const renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs')
}


const createCampground = async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground.id}`)
}

const showCampground = async (req, res) => {

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
}

const renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit.ejs', { campground });
}



const updateCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground }).exec();
    req.flash('success', 'Successfully updated Campground!')
    res.redirect(`/campgrounds/${id}`);
}

const deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground')
    res.redirect(`/campgrounds`)
}