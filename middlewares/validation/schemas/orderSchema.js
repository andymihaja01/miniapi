const Joi = require('joi');
const schema  = Joi.object({
    products: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string(),
                quantity: Joi.number()
            })
        )
        .min(1)
        .required()
}).options({ stripUnknown: true });

module.exports = schema