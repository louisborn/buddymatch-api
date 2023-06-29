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

const MatchSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    acceptor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accepted: {
        type: Boolean,
        default: false
    },
    matchDate: {
        type: Date,
        default: Date.now
    }
});

exports.Match = Match = mongoose.model('Match', MatchSchema);

exports.populate = async () => {
    await User.deleteMany({});

    console.log('dev database reset: success');

    dummies.forEach(async (user) => {
        const model = new User(user);
        await model.save().then(() => console.log('populating database with user'));
    });
}