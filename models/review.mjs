import mongoose from 'mongoose';
export { Review };
const { Schema } = mongoose;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
});

const Review = mongoose.model('Review', reviewSchema)