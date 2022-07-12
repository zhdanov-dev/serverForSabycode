const bcrypt = require('bcrypt');
const {User, SessionList} = require('../models/models');
const tokenController = require('./tokenController');

class userController {
    async registration(req, res) {
        const {name, email, password} = req.body; // принимаем данные из body
        if (!name || !email || !password) throw new Error('Все поля должны быть заполнены!'); 
        const candidate = await User.findOne({where: {email: email}}); // если в базе данных уже есть пользовтель, то ошибка
        if (candidate) throw new Error('Пользователь уже существует!');
        const hash = await bcrypt.hash(password, 5); // хешируем пароль
        const user = await User.create({name: name, email: email, password: hash}); // и создаем пользователя
        await SessionList.create({userId: user.id}); // также сразу создаем для него список его сессий
        const tokens = tokenController.genereteToken(user.id, email); // и генерируем токены
        await tokenController.saveToken(user.id, tokens.refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, { // записываем refreshToken в куки
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        res.json(tokens.accessToken);
    }

    // для логина почти тоже самое

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
        res.json(tokens.accessToken);
    }

    // для выхода удаляем из бд таблицу с токеном, удаляем также и из кук

    async logout(req, res) {
        const {refreshToken} = req.cookies;
        await tokenController.removeToken(refreshToken);
        res.clearCookie('refreshToken');
        return res.json("logout");
    }

    // для перезаписи токена все тоже самое, только еще и валидация

    async refresh(req, res) {
        const {refreshToken} = req.cookies;
        if (!refreshToken) throw new Error('Пользователь не авторизован!');
        const userData = tokenController.validateRefresh(refreshToken); // валидируем токен
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