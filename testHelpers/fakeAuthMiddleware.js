const isAuth = require("#middlewares/isAuth.js")
const sinon = require("sinon")
const originalValidateToken = isAuth.validateToken
const useStub = { value:false }

const fakeUser = {
    _id:"testUserId",
    username:"testUser"
}

exports.fakedMiddlewareUser = fakeUser
/*
* this class lets the validateToken method be stubbed anytime it is needed
* instead of stubbing the method manually at the top of every file and checking whether it is needed or not
*/

exports.useMiddlewareStub = function (){
    useStub.value = true
}

exports.restoreMiddlewareStub = function (){
    useStub.value = false
}

exports.validateToken = function(req,res,next){
    if(useStub.value){
        req.user = fakeUser
        next()
    } else {
        originalValidateToken(req,res,next)
    }
}

sinon.stub(isAuth,"validateToken").callsFake(module.exports.validateToken)
