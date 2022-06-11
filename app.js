const config = require('config');
const express = require('express');
const postgreClient = require('./database/postgresql');
const app = express();

const SERVER_PORT = config.get('serverPort') || 5000;

// json parser middleware
app.use(express.json({ extended: true }));

// API handlers
app.use('/api/table/', require('./routes/table.routes'));

async function start() {
  // Подключение базы данных
  await postgreClient
    .connect()
    .then(() => console.log('Server is now connected to database'))
    .catch((error) => console.log('Database connection error :>>', error.stack));
  // Запуск сервера
  app.listen(SERVER_PORT, (error) => {
    if (error) return console.log('Server error :>>', error);
    console.log(`Server is now listening on port ${SERVER_PORT}`);
  });
}

start();