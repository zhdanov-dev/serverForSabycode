const Router = require('express');
const router = new Router();
const userRouter = require('./userRoute');
const sessionListRoute = require('./sessionListRoute');
const sessionRoute = require('./sessionRoute');

router.use('/user', userRouter);
router.use('/sessionList', sessionListRoute);
router.use('/session', sessionRoute);


module.exports = router;