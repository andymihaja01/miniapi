const express = require("express")
const router  = express.Router()
const {validateToken} = require("#middlewares/isAuth.js")

const AuthController = require("#controllers/auth.js");

router.post('/login', AuthController.login)
router.post('/logout', validateToken, AuthController.logout)
router.post('/register', AuthController.register)
router.post('/refreshToken', AuthController.refreshToken)
router.get('/protected', validateToken ,AuthController.protected)

module.exports = router