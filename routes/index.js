const Router = require('express');
const router = new Router();
const userRouter = require('./userRoute');
const sessionListRoute = require('./sessionListRoute');
const sessionRoute = require('./sessionRoute');

// здесь находятся только роуты, а конкрентно в index.js они собираются в один

router.use('/user', userRouter); // для userRoute 
router.use('/sessionList', sessionListRoute); // для sessionListRoute
router.use('/session', sessionRoute); // для sessionRoute


module.exports = router;