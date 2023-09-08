import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import findOrCreate from 'mongoose-findorcreate';

const { Schema } = mongoose;
export { User };

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    googleId: {
        type: String,
    },
    username: String

})


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model('User', userSchema)