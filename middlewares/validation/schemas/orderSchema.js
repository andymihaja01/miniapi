const Joi = require('joi');
const schema  = Joi.object({
    order: Joi.array()
        .items()
        .min(1)
        .required(),
    profile: Joi.object({
        email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
        name: Joi.string()
        .alphanum()
        .min(2)
    }).required()
}).options({ stripUnknown: true });

module.exports = schema