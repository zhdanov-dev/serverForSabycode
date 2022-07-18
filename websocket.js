const express = require('express');
const app = express();
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();
const cors = require('cors');
const path = require('path');
const sequelize = require('./db');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewares/auth-middleware');
const fs = require('fs');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.resolve(__dirname, 'sessions'))); // endpoint с именем файла отдаст файл как статику
app.use('/api', router);


// запускаем sequelize и само приложение

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

// эта часть овечает за получение сообщения от клиента и рассылке его всем остальным клиентам

app.ws('/', (ws) => {
    ws.on('message', (message) => {
        messageJSON = JSON.parse(message); // получаем сообщение и парсим его
        switch (messageJSON.event) { // в зависимости от события две функции
            case 'connection':
                connectionHandler(ws, messageJSON); // первое подключение 
                break;
            case 'editorUpdate':
                broadcast(ws, messageJSON); // отправка сообщения
                break;
            case 'languageUpdate':
                languageUpdate(ws, messageJSON); // изменение языка
                break;
        }
    })
});

// изменение языка

const languageUpdate = function(ws, message) {
    const messageForClient = { // формируем сообщение для клиента 
        event: 'languageUpdate',
        language: message.language
    };

    if (client.id === message.sessionId && client !== ws) {
        client.send(JSON.stringify(messageForClient)); // рассылаем всем клиентам в текущей сессии сообщения об изменении файла
      }
}

const connectionHandler = function(ws, message) {
    console.log('connection');
    ws.id = message.sessionId; // присваиваем клиенту id
    ws.username = message.username;
    let users = '';
    aWss.clients.forEach(client => { 
        users = users + client.username + ' ';
    });

    let doc;
    try {
        doc = fs.readFileSync(path.resolve(__dirname, 'sessions', `${message.sessionId}` + '.txt')).toString(); // читаем файл
    } catch(e) {
        fs.writeFileSync(path.resolve(__dirname, 'sessions', `${message.sessionId}` + '.txt'), ''); // если файла нет, то создаем его
    }

    const messageForClient = { // формируем сообщение для клиента 
        event: 'connection',
        username: message.username,
        input: doc,
        users: users
    }
    ws.send(JSON.stringify(messageForClient)); // отправляем сообщение о подключении на клиент
}

//рассылаем сообщение всем клиентам

function broadcast(ws, message) {
    try {
        fs.writeFileSync(path.resolve(__dirname, 'sessions', `${message.sessionId}` + '.txt'), message.input); // обновляем файл
    } catch(e) {
        console.log(e);
    }

    let users = '';
    const messageForClient = { // формируем сообщение для клиента 
        event: message.event,
        input: message.input,
        users: users
    }

    aWss.clients.forEach(client => {
        users = users + client.username + ' ';
        if (client.id === message.sessionId && client !== ws) {
          client.send(JSON.stringify(messageForClient)); // рассылаем всем клиентам в текущей сессии сообщения об изменении файла
        }
    });
}

app.use(authMiddleware); // middleware для проверки авторизован ли пользователь

start();