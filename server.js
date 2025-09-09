const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and message history
let users = [];
let userCount = 0;
let messageHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected');
    userCount++;
    io.emit('user-count', userCount);
    
    // Send message history to newly connected user
    socket.emit('message-history', messageHistory);
    
    // Handle new user joining
    socket.on('newuser', (username) => {
        socket.username = username;
        users.push(username);
        io.emit('update', `${username} joined the chat`);
        console.log(`${username} joined the chat`);
    });
    
    // Handle chat messages
    socket.on('chat', (message) => {
        // Add timestamp if not provided
        if (!message.time) {
            message.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Store message in history (keep last 100 messages)
        messageHistory.push(message);
        if (messageHistory.length > 100) {
            messageHistory.shift();
        }
        
        // Broadcast to all users except sender
        socket.broadcast.emit('chat', message);
    });
    
    // Handle typing indicator
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });
    
    // Handle stop typing
    socket.on('stop-typing', () => {
        socket.broadcast.emit('stop-typing');
    });
    
    // Handle user disconnection
    socket.on('disconnect', () => {
        userCount--;
        io.emit('user-count', userCount);
        
        if (socket.username) {
            io.emit('update', `${socket.username} left the chat`);
            users = users.filter(user => user !== socket.username);
            console.log(`${socket.username} left the chat`);
        }
    });
    
    // Handle explicit exit
    socket.on('exituser', (username) => {
        userCount--;
        io.emit('user-count', userCount);
        io.emit('update', `${username} left the chat`);
        users = users.filter(user => user !== username);
        console.log(`${username} left the chat`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});