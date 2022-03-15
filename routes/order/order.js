const express = require("express")
const router  = express.Router()
const {validateToken} = require("#middlewares/isAuth.js")
const {validateOrderSchema, validateOrderStatus} = require("#middlewares/validation/validation.js")
const orderController = require("#controllers/order.js");
router.post('/createOrder', validateToken, validateOrderSchema, orderController.createOrder)
router.post('/notifyOrderStatus/:orderId',validateToken, validateOrderStatus, orderController.notifyOrderStatus) 

module.exports = router