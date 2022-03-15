const { UserNotFoundError,InvalidOrderError ,ProductNotFoundError } = require("#errors/errors.js")
const NotificationService = require("#services/notification.js")
const OrderRepository = require("#repositories/orderRepository.js")
const ProductRepository = require("#repositories/productRepository.js")
const UserRepository = require("#repositories/userRepository.js")
/**
 * @typedef {Object} PartialProduct
 * @property {String} productId - The id of the product
 */
/**
 * @typedef {Object} PartialOrder
 * @property {String} customer - The customerId
 * @property {PartialProduct} products - The order items
 * @property {{address:String}} shippingInfo
 */

/**
 * @typedef {Object} FullProduct
 * @property {String} productId - The id of the product
 * @property {String} serialNumber - The serial number if there is any
 * @property {Boolean} isFigure - If it is a figure
 * @property {Boolean} isFamilyPack - If it is a family pack
 * @property {Number} originalUnitPrice - The original price associated with the product
 * @property {Number} finalUnitPrice - The price at which it is bought
 */
/**
 * @typedef {Object} CompleteOrder
 * @property {String} customer - The customerId
 * @property {FullProduct} products - The order items
 * @property {Number} discount - The discount percentage if any
 * @property {{address:String}} shippingInfo
 * @property {String:'QUEUED'|'IN PROGRESS'|'READY FOR DELIVERY'} status - The order status
 * @property {Date} orderDate - The date at which the order was created
 */

/**
 * creates an order, with status QUEUED, and fills the product informations
 * @param {PartialOrder} order 
 * @param {String} userId 
 */
exports.createOrder = async function(order, userId){
        const user = await UserRepository.findById(userId)
        if(user == null){
            throw new UserNotFoundError()
        }

        if(!order.products || !order.products.length>0){
          throw new InvalidOrderError()
        }

        order.customer = userId
        order.discount = 0
        order.orderDate = new Date(Date.now())
        order.shippingInfo = { address : user.info.address}
        const productFillPromises = order.products.map((product) => {
            return new Promise(async (resolve,reject) => {
                try{
                    const foundProduct = await ProductRepository.getProductById(product.productId)
                    if(foundProduct == null){
                        throw new ProductNotFoundError(product.productId)
                    }
                    product.serialNumber = null
                    product.isFigure = foundProduct.isFigure
                    product.isFamilyPack = foundProduct.isFamilyPack
                    product.originalUnitPrice = foundProduct.unitPrice
                    product.finalUnitPrice = foundProduct.unitPrice
                    resolve(true)
                } catch (error){
                    reject(error)
                }
            })
        })
        const result = Promise.all(productFillPromises)
        await result
        await module.exports.applyDiscounts(order)
        const createdOrder = OrderRepository.createOrder(order)
        return createdOrder
}

/**
 * updates an order, Complete order is the complete order with all fields
 * @param {String} orderId 
 * @param {CompleteOrder} orderData
 */
 exports.updateOrder = async function(orderId, orderData){
    // do not alter original object
    orderData = JSON.parse(JSON.stringify(orderData))
    const order = OrderRepository.getOrderById(orderId)
    orderData.customer = order.customer
    await module.exports.applyDiscounts(orderData)
    const updatedOrder = await OrderRepository.updateOrderById(orderId, orderData)
    return updatedOrder
}

exports.updateSerialNumbersAndStatus = async function(orderId, orderData){
    const order = await OrderRepository.getOrderById(orderId)
    order.products.forEach((product,k) => {
        if(orderData.products[k].productId == product.productId){
            product.serialNumber = orderData.products[k].serialNumber
        } else {
            // In case the order of the products is not the same
            const disorderedProduct = orderData.products.find((dataProduct) => dataProduct.productId == product.productId)
            if(disorderedProduct !== undefined){
                product.serialNumber = disorderedProduct.serialNumber
            } else {
                throw new MissingProductError(product.productId)
            }
        }
    })
    order.status = orderData.status
    const updatedOrder = await module.exports.updateOrder(orderId,order)
    return updatedOrder
}

exports.createInvoice = async function(orderId){
    const order = await OrderRepository.getOrderById(orderId)
    const user = await UserRepository.findById(order.customer)
    order.customer = {
        username:user.username,
        userId:user._id
    }
    return order;
}

exports.updateOrderStatusById = async function(orderId, status){
    const updatedOrder = await OrderRepository.updateOrderStatusById(orderId, status)
    // check if order is ready and send notification
    if(updatedOrder.status == "READY FOR DELIVERY"){
        // dont wait for this to answer the request
        setImmediate(async() => {
            await NotificationService.notifyOrderDoneWithInvoice(updatedOrder._id)
        })
    }
    return updatedOrder
}

function applyFamilyDiscount (order){
    // Discount if it contains "MiNi Family pack"
    if(order.products.some(product => product.isFamilyPack)){
        order.discount = 0.2
    }
    return order
}
exports.applyFamilyDiscount = applyFamilyDiscount 

function applyMiniFigureDiscount(order){
    // Discount if it contains 50+ "MiNi Figures"
    const figures = order.products.filter(product => product.isFigure)
    const figureCount = figures.reduce((acc, figure) => acc + figure.quantity,0)
    if(figureCount>=50){
        figures.forEach((figure) => figure.finalUnitPrice = 9)
        order.miniFigureOverallDiscount = true
    }
    return order
}
exports.applyMiniFigureDiscount = applyMiniFigureDiscount 

exports.orderWith

exports.applyDiscounts = async function(order){
    const discounts = [module.exports.applyFamilyDiscount, module.exports.applyMiniFigureDiscount]
    discounts.forEach((discount) => discount(order))
    // always update the final price after applying discounts
    order.finalPrice = module.exports.computeFinalPrice(order)
    return order
}

function computeFinalPrice(order){
    const total = order.products.reduce((acc, product) => acc + (product.finalUnitPrice * product.quantity),0)
    const discountedTotal = total * (1-order.discount);
    return discountedTotal
}
exports.computeFinalPrice = computeFinalPrice 