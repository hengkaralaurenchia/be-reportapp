const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const loginController = require('../controller/login.controller')
// const logoutController = require('../controller/logout.controller')
// const { verifyToken } = require('../middlewares/auth')

router.post('/', upload.none(), loginController.login)
// router.post('/logout', verifyToken, logoutController.logout);
router.post('/register', upload.none(), loginController.register);

module.exports = router