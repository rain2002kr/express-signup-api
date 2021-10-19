const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')
const auth = require('./api/auth')
const user = require('./api/user')

router.use('/auth', auth)
// Promise chain 으로 authMiddleware 에서 토큰 체크후 다음 user 라우터로 넘어갈수있음. 
router.use('/user', authMiddleware)
router.use('/user', user)

module.exports = router