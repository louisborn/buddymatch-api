require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const {Schema} = require('mongoose');
var bodyParser = require('body-parser');

const app = express()
app.use(bodyParser());
const port = 3000

mongoose.connect(process.env.db);

const UserSchema = new Schema(
    {first_name: String, second_name: String}
);
const User = mongoose.model('User', UserSchema);

const testUsers = [
    ['Louis', 'Born'],
    ['Pascal', 'Pelzer']
];

async function reset() {
    testUsers.forEach(user => {
        const model = new User({first_name: user[0], last_name: user[1]});
        model.save();
    });
}

app.post('/login', async function (req, res) {
    console.log('body: ', JSON.stringify(req.body));
});

app.post('/register', async function (req, res) {
    const newUser = new User({first_name: req.body.first_name, second_name: req.body.second_name});
    await newUser.save().then(() => {
        console.log('new user created');
        res.json({'result': 'success'});
    });
});

app.get('/:id/users/list', async function (req, res) {
    let foundUsers = await User.find({_id: {$ne: req.params.id}});
    res.send(JSON.stringify(foundUsers));
});

app.get('/user/:id', async function (req, res) {
    await User.find({_id: req.params.id}).then((user) => {
        res.json(user);
    })
});

reset().then(() => {
    console.log('Database reset success')
});

app.listen(port, () => {
    console.log(port)
});