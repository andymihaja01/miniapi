const express = require("express")
const router  = express.Router();
const auth = require("./auth/auth")

router.use('/auth', auth)

router.use('/',(req,res)=>{
    res.send('Hello, router is working!')
})

module.exports = router