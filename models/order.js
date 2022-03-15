const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const OrderSchema = Schema({
    customer:{
        type: ObjectId, ref: 'Users'
    },
    products:[{
        productId: {type: ObjectId, ref: 'Products'},
        serialNumber: String,
        isFigure:{
            type:Boolean,
            default:false
        },
        isFamilyPack:{
            type:Boolean,
            default:false
        },
        originalUnitPrice: Number,
        finalUnitPrice: Number,
        quantity: Number,
    }],
    discount: {
        type:Number,
        default:0
    },
    shippingInfo: {
        address: String,
    },
    status: {
        type:String,
        enum:['QUEUED','IN PROGRESS','READY FOR DELIVERY'],
        default:'QUEUED'
    },
    finalPrice: Number,
    orderDate: Date
})

module.exports = mongoose.model("Orders",OrderSchema)