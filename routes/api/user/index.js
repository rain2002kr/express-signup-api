const router = require('express').Router()
const controller = require('./user.controller')

router.get('/list', controller.list)
router.post('/assign-admin', controller.assignAdmin)
router.post('/change-password', controller.changePassword)

module.exports = router



///:username