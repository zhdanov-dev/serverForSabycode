const bcrypt = require('bcrypt');
const {User, SessionList} = require('../models/models');
const tokenController = require('./tokenController');

class userController {
    async registration(req, res) {
        const {name, email, password} = req.body;
        if (!name || !email || !password) throw new Error('Все поля должны быть заполнены!');
        const candidate = await User.findOne({where: {email: email}});
        if (candidate) throw new Error('Пользователь уже существует!');
        const hash = await bcrypt.hash(password, 5);
        const user = await User.create({name: name, email: email, password: hash});
        await SessionList.create({userId: user.id});
        const tokens = tokenController.genereteToken(user.id, email);
        await tokenController.saveToken(user.id, tokens.refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        res.json({...tokens, user: user.id, email});
    }

    async login(req, res) {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email: email}});
        if (!user) throw new Error('Пользователь не зарегистрирован');
        const checkPass = await bcrypt.compare(password, user.password);
        if (!checkPass)  throw new Error('Неверный пароль!');
        const tokens = tokenController.genereteToken(user.id, email);
        await tokenController.saveToken(user.id, tokens.refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        res.json({...tokens, user: user.id, email});
    }

    async logout(req, res) {
        const {refreshToken} = req.cookies;
        const token = await tokenController.removeToken(refreshToken);
        res.clearCookie('refreshToken');
        return res.json(token);
    }

    async refresh(req, res) {
        const {refreshToken} = req.cookies;
        if (!refreshToken) throw new Error('Пользователь не авторизован!');
        const userData = tokenController.validateRefresh(refreshToken);
        const findToken = await tokenController.findToken(refreshToken);
        if (!userData || !findToken) throw new Error('Пользователь не авторизован!');
        const user = await User.findOne({where: {id: userData.id}});
        const tokens = tokenController.genereteToken(user.id, user.email);
        await tokenController.saveToken(user.id, tokens.refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        res.json({...tokens, user: user.id, email: user.email});
    }
}

module.exports = new userController();