const jwt = require("jsonwebtoken")
const tokenStoreService = require("#services/token.js")

const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = require("#root/config.js")

function generateAccessToken(user) {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) 
}

function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
    tokenStoreService.storeToken(user,refreshToken)
    return refreshToken
}

async function refreshToken(token, user){
    if (!await tokenStoreService.hasToken(user,token)) {
        throw ({invalidToken:true})
    }
    await tokenStoreService.removeToken(user)
    const accessToken = generateAccessToken ({user})
    const refreshToken = generateRefreshToken ({user})
    return {accessToken,refreshToken}
}

async function logout(user){
    if (!await tokenStoreService.hasUser(user)) {
        throw ({invalidToken:true})
    }
    return await tokenStoreService.removeToken(user)
}

exports.generateAccessToken = generateAccessToken
exports.generateRefreshToken = generateRefreshToken
exports.refreshToken = refreshToken
exports.logout = logout