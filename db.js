const {Sequelize} = require('sequelize');

// данные для подключения к базе данных

module.exports = new Sequelize(
    "sabycodeDB", // имя
    "postgres", // пользователь
    "5536", // пароль
    {
        dialect: 'postgres',
        host: "localhost",
        port: "5432"
    }
)