import mongoose from 'mongoose';
import { } from 'ejs';
import { Campground } from '/mnt/internal/coding/Studying/YelpCamp/mine/models/campground.js'
export { seedDB }
import { cities } from './cities.js'
import { descriptors, places } from './seedHelpers.js'
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(console.log('dataBase Connected'));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        await new Campground({
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/484351',
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim dolores quos fuga, vitae nihil placeat asperioresomnis unde laboriosam perspiciatis, nisi eius animi at error pariatur cum iure id eaque",
            price: price
        }).save()
    }
}
