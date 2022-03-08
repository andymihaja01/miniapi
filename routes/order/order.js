const express = require("express")
const router  = express.Router()
const {validateOrderSchema} = require("#middlewares/validation/validation.js")
const orderController = require("#controllers/order.js");

router.post('/createOrder', validateOrderSchema, orderController.createOrder)
router.post('/notifyOrderReady', orderController.notifyOrderReady) 

module.exports = router