const debug = require("debug")("order")

exports.createOrder = async(req,res) => {
    let order = req.order
    debug(`Received order:`)
    debug(order)
    res.send(order)
}

exports.notifyOrderReady = async(req,res) => {
    let orderId = req.params.orderId
    debug(`The order ${orderId} is ready!`)
    res.sendStatus(200)
}