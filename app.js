import express from 'express';
import mongoose from 'mongoose';
import { } from 'ejs'; // requied ejs for templating 
import { Campground } from '/mnt/internal/coding/Studying/YelpCamp/mine/models/campground.js' // imports Campground model
import { seedDB } from '/mnt/internal/coding/Studying/YelpCamp/mine/seeds/index.js' // To seed our data base (deletes current DB)
import methodOverride from 'method-override';
import engine from 'ejs-mate';



// Establish the DB connection
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(console.log('dataBase Connected'));
const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'))// override with POST having ?_method=DELETE
// sets the view engine to ejs
app.set('engine view', 'ejs')
app.engine('ejs', engine)

//Home Page
app.get('/', (req, res) => {
    res.render('home.ejs');
})

// All campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index.ejs', { campgrounds });
})

// Add new Campground form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs')
})

// the show page of specific campground
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show.ejs', { campground });
})


//edit page of specific campground form
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit.ejs', { campground });
})

//Add new campground
app.post('/campgrounds', async (req, res) => {
    const campground = await new Campground({ title: req.body.campground.title, location: req.body.campground.location }).save();
    res.redirect(`/campgrounds/${campground.id}`)
})

//edit page of specific campground form
app.put('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }).exec();
    res.redirect(`/campgrounds/${req.params.id}`);
    console.log(req.body)
})

app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect(`/campgrounds`)
})

app.listen(3000, () => {
    console.log('Connected to Port 3000!')
})