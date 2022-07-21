const path = require('path');
require('dotenv').config();
const express = require('express');
const app = express();
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();
const cors = require('cors');
const sequelize = require('./db');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewares/auth-middleware');
const fs = require('fs');
const {Session} = require('./models/models');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env_connect')});

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
            case 'close':
                close(ws, messageJSON); 
                break;
            case 'markersUpdate':
                markersUpdate(ws, messageJSON); 
                break;
            case 'disconnection':
                disconnection(ws, messageJSON); 
                break;
        }
    })
});

const markersUpdate = function(ws, message) {
    awssBroadcast(message, message, false, ws);
}

async function close(ws, message) {
    await Session.update({abilityToEdit: false}, {where: {sessionStatic: message.sessionId + '.txt'}});
    const messageForClient = {
        event: 'close',
        abilityToEdit: false
    };
    
    awssBroadcast(message, messageForClient, true, ws);
}

// изменение языка

async function languageUpdate(ws, message) {
    const messageForClient = { // формируем сообщение для клиента 
        event: 'languageUpdate',
        language: message.language
    };

    try {
        await Session.update({language: message.language}, {where: {sessionStatic: message.sessionId + '.txt'}});
    } catch {
        console.log('Не авторизован!');
    }

    awssBroadcast(message, messageForClient, false, ws);
}

async function connectionHandler(ws, message) {
    console.log('connection');
    ws.id = message.sessionId; 
    ws.username = message.username;
    let users = [];
    let first = false;
    let doc = '';
    let canEdit = true;
    let usersSession;
    let oneMoreUsers;
    let language;

    aWss.clients.forEach(client => {
        if (client.id === message.sessionId) {
            users.push(client.username);
        }
    });

    try {
        doc = fs.readFileSync(path.resolve(__dirname, 'sessions', `${message.sessionId}` + '.txt')).toString(); // читаем файл
    } catch {
        fs.writeFileSync(path.resolve(__dirname, 'sessions', `${message.sessionId}` + '.txt'), ''); // если файла нет, то создаем его
        first = true;
        oneMoreUsers = users;
        language = 'javascript';
    }
    
    try {
        const abilityToEdit = await Session.findOne({where: {sessionStatic: `${message.sessionId}.txt`}});
        if (abilityToEdit.abilityToEdit === false) {
            canEdit = false;
        }
        await Session.update({users: users}, {where: {sessionStatic: message.sessionId + '.txt'}});
        usersSession = await Session.findOne({where: {sessionStatic: message.sessionId + '.txt'}});
        oneMoreUsers = usersSession.users;
        language = usersSession.language;
    } catch {
        canEdit = true;
        oneMoreUsers = users;
        language = 'javascript';
    }

    const messageForClient = { // формируем сообщение для клиента 
        event: 'connection',
        username: message.username,
        input: doc,
        language: language,
        users: oneMoreUsers,
        first: first,
        abilityToEdit: canEdit 
    };

    awssBroadcast(message, messageForClient, true, ws);
}

const disconnection = function(ws, message) {
    let users;
    aWss.clients.forEach(client => {
        if (client.id === message.sessionId) {
            users.push(client.username);
        }
    });

    awssBroadcast(message, {event: 'disconnection', users: users}, true, ws);
}

//рассылаем сообщение всем клиентам

function broadcast(ws, message) {
    try {
        fs.writeFileSync(path.resolve(__dirname, 'sessions', `${message.sessionId}` + '.txt'), message.input); // обновляем файл
    } catch(e) {
        console.log(e);
    }

    awssBroadcast(message, message, false, ws);
}

const awssBroadcast = function(message, messageForClient, all, ws) {
    if (all) {
        aWss.clients.forEach(client => {
            if (client.id === message.sessionId) {
              client.send(JSON.stringify(messageForClient));
            }
        })
    } else {
        aWss.clients.forEach(client => {
            if (client.id === message.sessionId && client !== ws) {
              client.send(JSON.stringify(messageForClient));
            }
        });
    }
}

app.use(authMiddleware); // middleware для проверки авторизован ли пользователь

start();