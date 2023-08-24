import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
const { Schema } = mongoose;
export { User };

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    }
})


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema)