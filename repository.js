const mongoose = require('mongoose');
const {Schema} = require('mongoose');

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

    console.log("dev database reset: success");

    const testUsers = [
        ['louisborn111@email.com', 'test123', {}],
        ['pascal@email.com', 'test123', {}],
    ];

    testUsers.forEach(async (user) => {
        const model = new User({email: user[0], password: user[1], detail: user[2]});
        await model.save();
        console.log('populating database with user')
    });
}