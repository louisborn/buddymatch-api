require('dotenv').config();

const express = require('express');
const app =express();
const port = 3000
const {createServer} = require('http');
const {Server} = require('socket.io');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const repository = require('./repository');
const userController = require('./user');
var cors = require('cors');
const {authenticateToken} = require('./user');

const http = createServer(app);
const io = new Server(http, {
    cors: { origin: 'http://localhost:4200' }
});
mongoose.connect(process.env.db);

app.use(cors());
app.use(bodyParser());

io.on("connection", function(socket) {

    socket.on("user_join", function(data) {
        this.username = data;
        socket.broadcast.emit("user_join", data);
    });

    socket.on("chat_message", function(data) {
        io.emit("chat_message", { user: this.username, message: data });
    });

    socket.on("disconnect", function(data) {
        socket.broadcast.emit("user_leave", this.username);
    });
});

app.post('/login', userController.login);
app.post('/register', userController.register);
app.get('/:id/list', authenticateToken, userController.list);
app.get('/profile/:id', authenticateToken, userController.profile);
app.get('/match/:id/list', authenticateToken, userController.matchesByUser);
app.post('/match', authenticateToken, userController.match);
app.post('/match/:acceptor/accept/:sender', authenticateToken, userController.matchAccept);

repository.populate();

http.listen(port, () => {
    console.log(`application listening on port: ${port}`);
});