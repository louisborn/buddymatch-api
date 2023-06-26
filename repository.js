const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const {dummies} = require('./data/dummy-user');

const UserSchema = new Schema(
    {
        email: String,
        password: String,
        detail: {
            first_name: String,
            second_name: String,
            desc_short: String,
            motivation: String,
            study_program: String,
            attended_courses: [String],
            skills: [String]
        },
    }
);

exports.User = User = mongoose.model('User', UserSchema);

exports.populate = async () => {
    await User.deleteMany({});

    console.log('dev database reset: success');

    dummies.forEach(async (user) => {
        const model = new User(user);
        await model.save().then(() => console.log('populating database with user'));
    });
}