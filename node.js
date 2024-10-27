
const express = require('express');
const app = express();
const http = require('http');   

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const rooms = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = {
                bpm: 60,
                clients: []
            };
        }
        rooms[roomId].clients.push(socket.id);

        // Отправляем текущий темп новому клиенту
        socket.emit('updateBpm', rooms[roomId].bpm);

        // Обновляем темп для всех клиентов в комнате
        socket.on('updateBpm', (newBpm) => {
            rooms[roomId].bpm = newBpm;
            io.to(roomId).emit('updateBpm', newBpm);
            // Здесь можно добавить логику для воспроизведения звука
        });
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});