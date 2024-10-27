// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // статические файлы находятся в папке "public"

// Объект для хранения информации о комнатах
const rooms = {};

// Обработка подключения пользователя
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Обработка события присоединения к комнате
  socket.on('joinRoom', (room) => {
    // Если комната не существует, создаем ее с начальным темпом и состоянием
    if (!rooms[room]) {
      rooms[room] = { bpm: 60, isPlaying: false };
    }

    // Присоединяем пользователя к комнате
    socket.join(room);

    // Отправляем клиенту текущие данные комнаты
    socket.emit('roomData', rooms[room]);

    console.log(`Пользователь ${socket.id} присоединился к комнате: ${room}`);
  });

  // Обновление темпа в комнате
  socket.on('changeBpm', ({ room, bpm }) => {
    if (rooms[room]) {
      rooms[room].bpm = bpm;
      io.to(room).emit('updateBpm', bpm); // Отправляем новый темп всем участникам комнаты
    }
  });

  // Запуск метронома для всех в комнате
  socket.on('startMetronome', (room) => {
    if (rooms[room]) {
      rooms[room].isPlaying = true;
      io.to(room).emit('startMetronome');
    }
  });

  // Остановка метронома для всех в комнате
  socket.on('stopMetronome', (room) => {
    if (rooms[room]) {
      rooms[room].isPlaying = false;
      io.to(room).emit('stopMetronome');
    }
  });

  // Обработка отключения пользователя
  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер работает на порту ${PORT}`);
});
