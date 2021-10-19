const router = require('express').Router()
const controller = require('./auth.controller')

router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/check', controller.check)
router.post('/reset-password-init', controller.resetPasswordInit)
router.post('/reset-password-finish', controller.resetPasswordFinish)





module.exports = router