const { UserNotFoundError,InvalidOrderError ,ProductNotFoundError } = require("#errors/errors.js")
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
        const createdOrder = OrderRepository.createOrder(order)
        return createdOrder
}

/**
 * updates an order, Complete order is the complete order with all fields
 * @param {String} orderId 
 * @param {CompleteOrder} userId 
 */
 exports.updateOrder = async function(orderId, orderData){
    const order = OrderRepository.getOrderById(orderId)
    orderData.customer = order.customer
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

exports.updateOrderStatusById = async function(orderId, status){
    const updatedOrder = await OrderRepository.updateOrderStatusById(orderId, status)
    return updatedOrder
}

exports.applyDiscounts = async function(orderId){
    const order = await OrderRepository.getOrderById(orderId)
    // Discount if it contains "MiNi Family pack"
    
}