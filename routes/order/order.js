const express = require("express")
const router  = express.Router()
const {validateToken} = require("#middlewares/isAuth.js")
const {validateOrderSchema} = require("#middlewares/validation/validation.js")
const orderController = require("#controllers/order.js");
router.post('/createOrder', validateToken, validateOrderSchema, orderController.createOrder)
router.post('/notifyOrderReady', orderController.notifyOrderReady) 

module.exports = router