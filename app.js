require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000
const {createServer} = require('http');
const {Server} = require('socket.io');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const repository = require('./repository');
const userController = require('./user');
var cors = require('cors');
const {authenticateToken, updateChat} = require('./user');
const {Chat} = require('./repository');

// Create an HTTP server and configure Socket.IO
const http = createServer(app);
const io = new Server(http, {
    cors: {origin: 'https://buddymatch.vercel.app/'}
});

// Connect to the MongoDB database
mongoose.connect(process.env.db);

// Configure Express app
app.use(cors());
app.use(bodyParser());

// Socket.IO connection handling
io.on('connection', async (socket) => {
    // Join the chat room
    const room = socket.handshake.query.chatId;
    socket.join(room);

    socket.on('initial messages', async function (chatId) {
        const id = new mongoose.Types.ObjectId(chatId);
        const messages = await repository.Chat.findById(id);
        socket.emit('initial messages', messages);
    });

    // Handle private messages
    socket.on('private message', async function ({content, to, senderId}) {
        const chatId = new mongoose.Types.ObjectId(to);
        const userId = new mongoose.Types.ObjectId(senderId);
        const updatedChat = await updateChat(chatId, userId, content);
        if (updatedChat) {
            io.to(to).emit('private message', {
                content,
                from: senderId
            });
        }
    });

    // Handle client disconnection
    socket.on('disconnect', function (data) {
        console.log('disconnect');
    });
});

// Routes
app.post('/login', userController.login);
app.post('/register', userController.register);
app.get('/:id/list', authenticateToken, userController.list);
app.get('/profile/:id', authenticateToken, userController.profile);
app.post('/profile/:id', authenticateToken, userController.updateUser);
app.get('/match/:id/list', authenticateToken, userController.matchesBySender);
app.get('/match/acceptor/:id/list', authenticateToken, userController.matchesByAcceptor);
app.get('/list/chats/:id', authenticateToken, userController.listChats);
app.post('/match', authenticateToken, userController.match);
app.post('/match/:acceptor/accept/:sender', authenticateToken, userController.matchAccept);

// Uncomment the following line to populate the database with dummy user data
// repository.populate();

// Start the HTTP server
http.listen(port, () => {
    console.log(`application listening on port: ${port}`);
});