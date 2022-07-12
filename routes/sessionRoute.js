const Router = require('express');
const router = new Router();
const sessionController = require('../controllers/sessionController');


router.post('/addFile', sessionController.updateFile);
router.get('/getFile', sessionController.getFile);


module.exports = router;