const sequelize = require('../db');
const {DataTypes} = require('sequelize');

// здесь описываются таблицы базы данных, а также их отнешения

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, //  id
    name: {type: DataTypes.STRING, allowNull: false}, // имя
    email: {type: DataTypes.STRING, unique: true, allowNull: false}, // почта
})

const Token = sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, // id
    refreshToken: {type: DataTypes.STRING} // refresh токен
})

const SessionList = sequelize.define('sessionList', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true} // id
})

const Session = sequelize.define('session', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, // id
    abilityToEdit: {type: DataTypes.BOOLEAN, allowNull: false},
    language: {type: DataTypes.STRING},
    users: {type: DataTypes.ARRAY(DataTypes.STRING)},
    sessionStatic: {type: DataTypes.STRING, unique: true} // название сессии
})

const connection = sequelize.define('connection', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true} // id
})

User.hasOne(SessionList); // связь один к одному
SessionList.belongsTo(User);

User.hasOne(Token); // связь один к одному
Token.belongsTo(User);

SessionList.belongsToMany(Session, {through: connection}); // связь многие ко многим
Session.belongsToMany(SessionList, {through: connection});

module.exports = {
    User,
    SessionList,
    Session, 
    Token,
    connection
}