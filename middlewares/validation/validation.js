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
