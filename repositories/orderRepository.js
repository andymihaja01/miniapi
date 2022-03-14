const Product = require("#models/product.js")
const Order = require("#models/order.js")
const IncorrectOrderError = require('./errors/IncorrectOrderStatusError.js')
const { default: mongoose } = require("mongoose")
const {cleanOrder} = require("#repositories/utils/modelCleaner.js")
const product = require("#models/product.js")
/**
 * @typedef {Object} Product
 * @property {String} productId - The id of the product
 * @property {String} serialNumber - The serial number if there is any
 * @property {Boolean} isFigure - If it is a figure
 * @property {Number} originalUnitPrice - The original price associated with the product
 * @property {Number} finalUnitPrice - The price at which it is bought
 */
/**
 * @typedef {Object} Order
 * @property {String} customer - The customerId
 * @property {Product} products - The order items
 * @property {Number} discount - The discount percentage if any
 * @property {{address:String}} shippingInfo
 * @property {String:'QUEUED'|'IN PROGRESS'|'READY FOR DELIVERY'} status - The order status
 * @property {Date} orderDate - The date at which the order was created
 */

/**
 * Creates and saves an order to database
 * @param {Order} order 
 * @returns 
 */
async function createOrder(order){
    checkOrderStatus(order.status)
    const correctOrder = stripOrder(order)
    const orderToSave = new Order(correctOrder)
    const savedOrder = await orderToSave.save()
    const orderObject = await cleanOrder(savedOrder)
    return orderObject 
}

/**
 * Finds an order by id
 * @param {String} orderId 
 * @returns 
 */
async function getOrderById(orderId){
    const order = await Order.findOne({_id: mongoose.Types.ObjectId(orderId)}).exec()
    const orderObject = cleanOrder(order)
    return orderObject
}

/**
 * updates the order, replaces the whole object
 * @param {String} orderId 
 * @param {Order} orderData 
 */
async function updateOrderById(orderId, orderData){
    const existingOrder = await getOrderById(orderId)
    const updatedOrder = stripOrder(orderData)
    checkOrderStatus(updatedOrder)
    updatedOrder.orderDate = existingOrder.orderDate
    const orderToSave = new Order(updatedOrder)
    const savedOrder = await orderToSave.save()
    return savedOrder
}

/**
 * Returns an order with the correct fields
 * @param {Order} order 
 * @returns Order
 */
function stripOrder(order, updateDate = true){
    let strippedOrder = {
        customer : order.customer,
        discount : order.discount,
        shippingInfo : {
            address: order.shippingInfo.address
        },
        status: order.status,
        products:[]
    }
    if(updateDate){
        strippedOrder.orderDate = order.date
    }
    order.products.forEach((product) => {
        const currentProduct = {
            productId : product.productId,
            serialNumber : product.serialNumber,
            isFigure : product.isFigure,
            originalUnitPrice : product.originalUnitPrice,
            finalUnitPrice : product.finalUnitPrice,
            quantity : product.quantity
        }
        strippedOrder.products.push(currentProduct)
    })
    return strippedOrder
}

function checkOrderStatus(status){
    const validStatuses =  ['QUEUED', 'IN PROGRESS', 'READY FOR DELIVERY']
    if(!validStatuses.includes(status)){
        throw new IncorrectOrderError(status)
    }
}

module.exports = {
    createOrder,
    getOrderById,
    updateOrderById
}