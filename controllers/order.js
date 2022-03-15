const debug = require("debug")("order")
const OrderService = require("#services/order.js")
const MinifactoryService = require("#services/minifactory.js")
const IncorrectOrderStatusError = require("#repositories/errors/IncorrectOrderStatusError.js")
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

exports.notifyOrderStatus = async(req,res) => {
    try {

        let orderId = req.params.orderId
        let status = req.body.status
        const order = await OrderService.updateOrderStatusById(orderId, status)
        debug(`The order ${orderId} is ${status}}!`)
        res.sendStatus(200)
    } catch(error){
        if(error instanceof IncorrectOrderStatusError){
            res.status(400).send(error)
        } else {
            res.status(500).send(error)
        }
    }
}