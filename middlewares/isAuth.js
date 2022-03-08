const jwt = require("jsonwebtoken")
const {ACCESS_TOKEN_SECRET} = require("#root/config.js")

exports.validateToken = function(req, res, next){
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    if (token == null){
        res.status(400).send("Token not present")
    }  else {

        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) { 
                res.status(403).send("Token invalid")
            }
            else {
                req.user = user
                next() 
            }
        })
    }
}