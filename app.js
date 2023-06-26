require('dotenv').config();

const express = require('express');
const app =express();
const port = 3000

const mongoose = require('mongoose');
const http = require('http');
const io = require('socket.io');
const bodyParser = require('body-parser');

const repository = require('./repository');
const userController = require('./user');
const {Server} = require('socket.io');
var cors = require('cors');
const {authenticateToken} = require('./user');

const httpServer = http.createServer(app);
const server = new Server(httpServer);
mongoose.connect(process.env.db);

app.use(cors());
app.use(bodyParser());

server.on("connection", (socket) => {
    console.log("connected");
});

app.post('/login', userController.login);
app.post('/register', userController.register);
app.get('/:id/list', authenticateToken, userController.list);
app.get('/profile/:id', authenticateToken, userController.profile);
app.post('/match', authenticateToken, userController.match);

repository.populate();

app.listen(port, () => {
    console.log(`application listening on port: ${port}`);
});