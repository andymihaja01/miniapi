const debug = require("debug")("order")
const OrderService = require("#services/order.js")

exports.createOrder = async(req,res) => {
    let order = req.order
    debug(`Received order:`)
    debug(order)
    const createdOrder = await OrderService.createOrder(order)
    res.send(createdOrder)
}

exports.notifyOrderReady = async(req,res) => {
    let orderId = req.params.orderId
    debug(`The order ${orderId} is ready!`)
    res.sendStatus(200)
}