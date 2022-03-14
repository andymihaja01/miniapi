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
        const orderObject = model.toObject()
        orderObject._id = String(orderObject._id)
        orderObject.products.forEach((product) => {
            product._id = String(product._id) 
        });
        return orderObject
    }
    return order
}