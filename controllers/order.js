const debug = require("debug")("order")
const OrderService = require("#services/order.js")
const MinifactoryService = require("#services/minifactory.js")

exports.createOrder = async(req,res) => {
    let order = req.order
    debug(`Received order:`)
    debug(order)
    const createdOrder = await OrderService.createOrder(order)
    debug(`Order ${createdOrder._id} saved!`)
    MinifactoryService.queueOrder(createdOrder).then(async (queuedOrder) => {
        debug(`Order queued`)
        const updatedOrder = await OrderService.updateSerialNumbersAndStatus(createdOrder._id, queuedOrder)    
        debug(updatedOrder)
    })
    res.send(createdOrder)
}

exports.notifyOrderReady = async(req,res) => {
    let orderId = req.params.orderId
    debug(`The order ${orderId} is ready!`)
    res.sendStatus(200)
}