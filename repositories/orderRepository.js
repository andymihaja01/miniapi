const Product = require("#models/product.js")
const Order = require("#models/order.js")
const IncorrectOrderStatusError = require('./errors/IncorrectOrderStatusError.js')
const { default: mongoose } = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const {cleanOrder} = require("#repositories/utils/modelCleaner.js")
const product = require("#models/product.js")
/**
 * @typedef {Object} Product
 * @property {String} productId - The id of the product
 * @property {String} serialNumber - The serial number if there is any
 * @property {Boolean} isFigure - If it is a figure
 * @property {Boolean} isFamilyPack - If it is a family pack
 * @property {Number} originalUnitPrice - The original price associated with the product
 * @property {Number} finalUnitPrice - The price at which it is bought
 */
/**
 * @typedef {Object} Order
 * @property {String} customer - The customerId
 * @property {Product} products - The order items
 * @property {Number} discount - The discount percentage if any
 * @property {Number} finalPrice - The final price
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
    const strippedOrder = stripOrder(order)
    const correctOrder = fixOrderIds(strippedOrder)
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
    checkOrderStatus(updatedOrder.status)
    updatedOrder.orderDate = existingOrder.orderDate
    const correctOrder = fixOrderIds(updatedOrder)
    const savedOrder = await ( new Promise((resolve,reject ) => {
        Order.findOneAndReplace({_id:ObjectId(existingOrder._id)},correctOrder,{returnDocument :'after'}, (err,doc) => {
            if(err){
                reject(err)
            } else {
                resolve(doc)
            }
        })
    }))
    const cleanedSavedOrder = cleanOrder(savedOrder)
    return cleanedSavedOrder
}

async function updateOrderStatusById(orderId, status){
    checkOrderStatus(status)
    const order = await Order.findOne({_id: mongoose.Types.ObjectId(orderId)}).exec()
    order.status = status
    const updatedOrder = await order.save()
    const cleanedUpdatedOrder = cleanOrder(updatedOrder)
    return cleanedUpdatedOrder
}

function fixOrderIds(order){
    order.products.forEach((product) => {
        product.productId = ObjectId(product.productId)
    })
    return order
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
            address: order?.shippingInfo?.address
        },
        status: order.status,
        miniFigureOverallDiscount: order.miniFigureOverallDiscount || false,
        finalPrice: order.finalPrice,
        products:[]
    }
    if(updateDate){
        strippedOrder.orderDate = order.orderDate
    }
    order.products.forEach((product) => {
        const currentProduct = {
            productId : product.productId,
            serialNumber : product.serialNumber,
            isFigure : product.isFigure,
            isFamilyPack : product.isFamilyPack,
            originalUnitPrice : product.originalUnitPrice,
            finalUnitPrice : product.finalUnitPrice,
            quantity : product.quantity
        }
        strippedOrder.products.push(currentProduct)
    })
    return strippedOrder
}

const validStatuses =  ['QUEUED', 'IN PROGRESS', 'READY FOR DELIVERY']
function checkOrderStatus(status){
    if(!validStatuses.includes(status)){
        throw new IncorrectOrderStatusError(status)
    }
    return status
}

module.exports = {
    createOrder,
    getOrderById,
    updateOrderById,
    fixOrderIds,
    checkOrderStatus,
    updateOrderStatusById
}