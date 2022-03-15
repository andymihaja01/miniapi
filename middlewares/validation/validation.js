const IncorrectOrderStatusError = require("#repositories/errors/IncorrectOrderStatusError.js")
const orderSchema = require("./schemas/orderSchema")

exports.validateOrderSchema = function(req,res,next){
    const order = req.body
    const {error, value:validatedOrder} = orderSchema.validate(order)
    if(error){
        res.status(400).send({message:"Data error",  error})
    } else {
        req.order = validatedOrder
        next()
    }
}

const validStatuses =  ['QUEUED', 'IN PROGRESS', 'READY FOR DELIVERY']
exports.validateOrderStatus = function(req,res,next){
    const status = req.body.status
    if(!validStatuses.includes(status)){
        res.status(400).send({error: new IncorrectOrderStatusError(status)})
    } else {
        next()
    }
}
