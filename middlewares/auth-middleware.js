const tokenController = require('../controllers/tokenController');

module.exports = function(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new Error('Ошибка авторизации!');
        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) throw new Error('Ошибка авторизации!');
        const userData = tokenController.validateAccess(accessToken);
        if (!userData) throw new Error('Ошибка авторизации!');
        req.user = userData.id;
        next();
    } catch (error) {
        return error;
    }
}