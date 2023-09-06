import mongoose from 'mongoose';
import { } from 'ejs';
import { Campground } from '../models/campground.mjs'
export { seedDB }
import { cities } from './cities.js'
import { descriptors, places } from './seedHelpers.js'
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(console.log('dataBase Connected'));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        await new Campground({
            author: '64e48b6b4c11c7395ab92ebc',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim dolores quos fuga, vitae nihil placeat asperioresomnis unde laboriosam perspiciatis, nisi eius animi at error pariatur cum iure id eaque",
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: "https://cdn.pixabay.com/photo/2023/08/01/12/46/mountain-8162918_960_720.jpg",
                    filename: "YelpCamp/umfkfylxqq5qcvewja89",

                },
                {
                    url: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg",
                    filename: "YelpCamp/owosqro8vjddavfvnbcz",

                }

            ],

        }).save()
    }
}
