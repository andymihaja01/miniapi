const mongoose = require("mongoose")
const ProductSchema = mongoose.Schema({
    name:String,
    unitPrice: Number,
    isFigure:{
        type:Boolean,
        default:false
    },
    isFamilyPack:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model("Products",ProductSchema)