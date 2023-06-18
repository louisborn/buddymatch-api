require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const repository = require('./repository');
const userController = require('./user');

const app = express()
const port = 3000

mongoose.connect(process.env.db);

app.use(bodyParser());

app.post('/login', userController.login);
app.post('/register', userController.register);
app.get('/:id/list', userController.list);
app.get('/profile/:id', userController.profile);

repository.populate();

app.listen(port, () => {
    console.log(`application listening on port: ${port}`);
});