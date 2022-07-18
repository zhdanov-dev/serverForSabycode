const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login); // роут авторизации
router.post('/logout', userController.logout); // роут выхода
router.get('/refresh', userController.refresh); // роут на перезапись access токена


module.exports = router;