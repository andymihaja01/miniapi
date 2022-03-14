/**
 * converts to a simple object and makes the id a string instead of an objectid
 * @param {Model} model to convert 
 */
exports.cleanModel = function(model){
    if(model.toObject != undefined){
        const modelObject = model.toObject()
        modelObject._id = String(modelObject._id)
        return modelObject
    }
    return model
}

/**
 * converts to a simple object and makes the ids strings instead of objectids
 * @param {Model} model to convert 
 */
 exports.cleanOrder = function(order){
    if(order.toObject != undefined){
        const orderObject = order.toObject()
        if(order.customer){
            orderObject.customer = String(orderObject.customer)
        }
        orderObject._id = String(orderObject._id)
        orderObject.products.forEach((product) => {
            product.productId = String(product.productId)
            delete product._id
        });
        orderObject.orderDate = new Date(order.orderDate)
        return orderObject
    }
    return order
}