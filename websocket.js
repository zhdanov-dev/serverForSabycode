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
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'files')));
app.use('/api', router);
app.use(authMiddleware);

// запускаем sequelize и само приложение

const start = async () => {
    try {

        app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

// эта часть овечает за получение сообщения от клиента и рассылке его всем остальным клиентам
// возможно необходимо проверять относится ли клиент к текущей сессии, но у меня итак все работало

app.ws('/', (ws) => {
    ws.on('message', (message) => {
        message = JSON.parse(message);
        broadcast(message);
    })
});

function broadcast(message) {
    aWss.clients.forEach(client => {
        client.send(JSON.stringify(message));
    })
}

start();