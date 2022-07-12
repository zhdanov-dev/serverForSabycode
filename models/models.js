const sequelize = require('../db');
const {DataTypes} = require('sequelize');

// здесь описываются таблицы базы данных, а также их отнешения

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false}
})

const Token = sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING}
})

const SessionList = sequelize.define('sessionList', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Session = sequelize.define('session', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sessionStatic: {type: DataTypes.STRING, unique: true}
})

const connection = sequelize.define('connection', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

User.hasOne(SessionList);
SessionList.belongsTo(User);

User.hasOne(Token);
Token.belongsTo(User);

SessionList.belongsToMany(Session, {through: connection});
Session.belongsToMany(SessionList, {through: connection});

module.exports = {
    User,
    SessionList,
    Session, 
    Token,
    connection
}