const Joi = require('joi');
const schema  = Joi.object({
    products: Joi.array()
        .items()
        .min(1)
        .required()
}).options({ stripUnknown: true });

module.exports = schema