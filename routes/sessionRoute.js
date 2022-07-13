const Router = require('express');
const router = new Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middlewares/auth-middleware');

// роут на добавление файла в бд

router.post('/addFile', authMiddleware, sessionController.createSession);


module.exports = router;