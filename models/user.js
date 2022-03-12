const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    passwordHash:{
        type:"String",
        required: true
    },
    salt:{
        type:"String",
        required: true
    },
    info:{
        address:String
    }
})

module.exports = mongoose.model("Users",UserSchema)