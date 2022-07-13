const tokenController = require('../controllers/tokenController');

// непосредственно сам middleware для проверки токена

module.exports = function(req, res, next) {
    try {
        const authHeader = req.headers.authorization; // есть ли хедер
        if (!authHeader) throw new Error('Ошибка авторизации!');
        const accessToken = authHeader.split(' ')[1]; // есть ли токен
        if (!accessToken) throw new Error('Ошибка авторизации!');
        const userData = tokenController.validateAccess(accessToken); // валидируется ли он
        if (!userData) throw new Error('Ошибка авторизации!');
        req.user = userData.id; // возвращаем userID
        next();
    } catch (error) {
        return error;
    }
}