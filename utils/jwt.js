const jwt = require("jsonwebtoken")
const tokenStoreService = require("#services/token.js")

const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = require("#root/config.js")

function generateAccessToken(user) {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) 
}

function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
    tokenStoreService.storeToken(user.id,refreshToken)
    return refreshToken
}

async function refreshToken(token){
    let user = jwt.verify(token, REFRESH_TOKEN_SECRET)
    let userId =  user.id
    if (!await tokenStoreService.hasToken(userId,token)) {
        throw ({invalidToken:true})
    }
    await tokenStoreService.removeToken(userId)
    const accessToken = generateAccessToken ({username:user.username, id:user.userId})
    const refreshToken = generateRefreshToken ({username:user.username, id:user.userId})
    return {accessToken,refreshToken}
}

async function logout(userId){
    if (!await tokenStoreService.hasUser(userId)) {
        throw ({invalidToken:true})
    }
    return await tokenStoreService.removeToken(userId)
}

exports.generateAccessToken = generateAccessToken
exports.generateRefreshToken = generateRefreshToken
exports.refreshToken = refreshToken
exports.logout = logout