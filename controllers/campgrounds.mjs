import { Campground } from '../models/campground.mjs'; // imports Campground model
import { Review } from '../models/review.mjs'; // imports Campground model
import { cloudinary } from '../cloudinary/index.mjs'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

export { index, renderNewForm, createCampground, showCampground, renderEditForm, updateCampground, deleteCampground }

const index = async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index.ejs', { campgrounds });
}

const renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs')
}


const createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
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
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

const deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground')
    res.redirect(`/campgrounds`)
}