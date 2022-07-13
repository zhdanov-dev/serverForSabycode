const Router = require('express');
const router = new Router();
const sessionListController = require('../controllers/sessionListController');
const authMiddleware = require('../middlewares/auth-middleware');

// здесь, как и в других файлах роут и функция, которая отарабывает на нем, но также middleware для проверки токена 

router.post('/addConnection', authMiddleware, sessionListController.addConnection); // роут на добавление соединения сессии с участником
router.post('/removeConnection', authMiddleware, sessionListController.removeConnection); // роут на удаление этого соединения
router.get('/getConnections', authMiddleware, sessionListController.getConnections); // роут на получение всех соединений


module.exports = router;