const express = require("express")
const router  = express.Router();
const auth = require("./auth/auth")
const order= require("./order/order")

router.use('/auth', auth)
router.use('/order', order)

router.use('/',(req,res)=>{
    res.send('Hello, router is working!')
})

module.exports = router