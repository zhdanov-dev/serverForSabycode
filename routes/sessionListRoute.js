const Router = require('express');
const router = new Router();
const sessionListController = require('../controllers/sessionListController');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/addConnection', authMiddleware, sessionListController.addConnection);
router.post('/removeConnection', authMiddleware, sessionListController.removeConnection);
router.get('/getConnections', authMiddleware, sessionListController.getConnections);


module.exports = router;