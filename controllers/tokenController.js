const jwt = require('jsonwebtoken');
const {Token} = require('../models/models');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env_connect')});

class tokenController {

    /**
     * Генерация пары токенов
     * @param {string} id - Id пользователя
     * @param {string} email - Email пользователя
     * Пара токенов access, refresh
     */

    genereteToken(id, email) {
        const accessToken = jwt.sign({id: id, email}, process.env.SECRET_KEY, {expiresIn: '1h'});
        const refreshToken = jwt.sign({id: id, email}, process.env.REFRESH_KEY, {expiresIn: '15d'});
        return { accessToken, refreshToken }
    }

    /**
     * Сохранение refresh токена в базу данных
     * @param {string} userId - Id пользователя
     * @param {string} refreshToken - refresh токен
     * Перезаписываем токен в бд, если такой таблицы нет, то создаем ее
     */

    async saveToken(userId, refreshToken) {
        const tokenData = await Token.findOne({where: {userId: userId}});
        if (tokenData) { 
            tokenData.refreshToken = refreshToken; 
            return tokenData.save();
        }
        const token = await Token.create({userId: userId, refreshToken: refreshToken});
        return token;
    }

    /**
     * Удаление refresh токена из базы данных
     * @param {string} refreshToken - refresh токен
     * Удаляем таблицу с refresh токеном из бд
     */

    async removeToken(refreshToken) {
        const tokenData = await Token.destroy({where: {refreshToken: refreshToken}});
        return tokenData;
    }

    /**
     * Ищем токен в базе данных
     * @param {string} refreshToken - refresh токен
     */

    async findToken(refreshToken) {
        const tokenData = await Token.findOne({where: {refreshToken: refreshToken}});
        return tokenData;
    }

    /**
     * Валидируем токены
     * @param {string} token - access/refresh токен
     */

    validateAccess(token) {
        try {
            const userData = jwt.verify(token, process.env.SECRET_KEY);
            return userData;
        } catch (error) {
            return error;
        }
    }

    validateRefresh(token) {
        try {
            const userData = jwt.verify(token, process.env.REFRESH_KEY);
            return userData;
        } catch (error) {
            return error;
        }
    }
}

module.exports = new tokenController();