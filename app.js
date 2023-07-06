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

const http = createServer(app);
const io = new Server(http, {
    cors: {origin: 'http://localhost:4200'}
});
mongoose.connect(process.env.db);

app.use(cors());
app.use(bodyParser());

io.on('connection', async (socket) => {
    const room = socket.handshake.query.chatId;
    socket.join(room);

    const initialChatId = new mongoose.Types.ObjectId(room);
    const messages = await repository.Chat.findById(initialChatId);
    io.to(room).emit('connected', messages);

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

    socket.on('disconnect', function (data) {
        console.log('disconnect');
    });
});

app.post('/login', userController.login);
app.post('/register', userController.register);
app.get('/:id/list', authenticateToken, userController.list);
app.get('/profile/:id', authenticateToken, userController.profile);
app.get('/match/:id/list', authenticateToken, userController.matchesBySender);
app.get('/match/acceptor/:id/list', authenticateToken, userController.matchesByAcceptor);
app.get('/list/chats/:id', authenticateToken, userController.listChats);
app.post('/match', authenticateToken, userController.match);
app.post('/match/:acceptor/accept/:sender', authenticateToken, userController.matchAccept);

// Commented out so that the userids dont change all the time :)
//repository.populate();

http.listen(port, () => {
    console.log(`application listening on port: ${port}`);
});