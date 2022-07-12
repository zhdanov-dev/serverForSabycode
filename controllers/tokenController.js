const jwt = require('jsonwebtoken');
const {Token} = require('../models/models');

class tokenController {
    genereteToken(id, email) {
        const accessToken = jwt.sign({id: id, email}, process.env.SECRET_KEY, {expiresIn: '1h'});
        const refreshToken = jwt.sign({id: id, email}, process.env.REFRESH_KEY, {expiresIn: '15d'});
        return { accessToken, refreshToken }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await Token.findOne({where: {userId: userId}});
        if (tokenData) { 
            tokenData.refreshToken = refreshToken; 
            return tokenData.save();
        }
        const token = await Token.create({userId: userId, refreshToken: refreshToken});
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await Token.destroy({where: {refreshToken: refreshToken}});
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await Token.findOne({where: {refreshToken: refreshToken}});
        return tokenData;
    }

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