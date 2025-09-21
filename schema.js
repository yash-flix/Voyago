const Joi = require("joi");

module.exports.listingSchema = Joi.object(
    {
        listing : Joi.object(
            {
                title : Joi.string().required(),
                description:Joi.string().required(),
                location :Joi.string().required(),
                country: Joi.string().required().min(0),
                price: Joi.number().required(),
                image : Joi.string().allow("" , null)
            }
        ).required()
    }
)