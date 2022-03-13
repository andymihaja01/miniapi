const jwt = require("jsonwebtoken")
const UserService = require("#services/user.js")
const TokenService = require("#services/token.js")
const {ACCESS_TOKEN_SECRET} = require("#root/config.js")

exports.validateToken = function(req, res, next){
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    if (token == null || token == ""){
        res.status(400).send("Token not present")
    }  else {
        jwt.verify(token, ACCESS_TOKEN_SECRET, async(err, user) => {
            if(await TokenService.hasUser(user._id)){
                if (err) { 
                    res.status(403).send("Invalid token")
                }
                else {
                    const fullUser = await UserService.findById(user._id)
                    if(fullUser == null){
                        res.status(403).send("Invalid token")
                    } else {
                        req.user = fullUser
                        next() 
                    }
                }
            } else {
                res.status(401).send("Token expired")
            }
        })
    }
}