const {User, SessionList} = require('../models/models');
const tokenController = require('./tokenController');

class userController {

    /**
     * Функция авторизации
     * @param {string} username - Имя пользователя
     * @param {string} email - Email пользователя
     * Если в базе данных нет записей о пользовтеле, создаем таблицу, также создаем список сессий пользователя
     * После гененрируем пару токенов, сохраняем refresh токен в куки и возвращаем access токен
     * Если же записи есть, то просто генерируем новую пару токенов, сохраняем refresh токен в куки и возвращаем access токен
     */

    async login(req, res) {
        const {username, email} = req.body;
        const candidate = await User.findOne({where: {email: email}});
        if (!candidate) {
            const user = await User.create({name: username, email: email});
            await SessionList.create({userId: user.id});
            const tokens = tokenController.genereteToken(user.id, email);
            await tokenController.saveToken(user.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, {
                maxAge: 15 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            res.json(tokens.accessToken);
        } else {
            const tokens = tokenController.genereteToken(candidate.id, email);
            await tokenController.saveToken(candidate.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, {
                maxAge: 15 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            res.json(tokens.accessToken);
        }
    }

    /**
     * Функция выхода 
     * Удаляем refresh токен из бд и очищаяем куки
     */

    async logout(req, res) {
        const {refreshToken} = req.cookies;
        await tokenController.removeToken(refreshToken);
        res.clearCookie('refreshToken');
        return res.json("logout");
    }

    /**
     * Перезапись access токена
     * По refresh токену из кук, находим пользователя и генерируем новую пару токенов
     */

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
        res.json(tokens.accessToken);
    }
}

module.exports = new userController();