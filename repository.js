const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const {dummies} = require('./data/dummy-user');

// Define the schema for the User collection
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

// Define the schema for the Match collection
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

// Define the schema for the Chat collection
const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

// Export the User model based on the UserSchema
exports.User = User = mongoose.model('User', UserSchema);

// Export the Match model based on the MatchSchema
exports.Match = Match = mongoose.model('Match', MatchSchema);

// Export the Chat model based on the chatSchema
exports.Chat = Chat = mongoose.model('Chat', chatSchema);

/**
 * Populates the database with dummy user data.
 * Deletes all existing users and creates new ones based on the dummies array.
 * @returns {Promise<void>} - Resolves when the database population is complete.
 */
exports.populate = async () => {
    await User.deleteMany({});

    console.log('dev database reset: success');

    dummies.forEach(async (user) => {
        const model = new User(user);
        await model.save().then(() => console.log('populating database with user'));
    });
}