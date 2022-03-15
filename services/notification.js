const OrderService = require("#services/order.js")

exports.notifyOrderDoneWithInvoice = async function( orderId){
    const order = await OrderService.createInvoice(orderId)
    // call an external service to notify the user here or do something else
    return order
}