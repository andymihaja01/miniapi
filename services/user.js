const User = require("#models/user.js")
const passwordUtils = require("#utils/password.js")
const jwtUtils = require("#utils/jwt.js")
const UserRepository = require("#repositories/userRepository.js")
const {UserNotFoundError, IncorrectPasswordError} = require("#errors/errors.js")
exports.findById = async function(userId){
    const user = await UserRepository.findById(userId)
    const userObject = user.toObject()
    userObject._id = String(user.id)
    return userObject 
}

exports.createUser = async function(username,password,info){
    const {passwordHash, salt} = passwordUtils.saltHash(password)
    const user = await UserRepository.createUser(username, passwordHash,salt,info)
    return user
}

exports.login = async function(username, password){
    const user = await UserRepository.getUserByUserName(username)

    if(user == null) {
        throw new UserNotFoundError()
    } else {
        if(passwordUtils.testPassword(password, user.passwordHash, user.salt)){
            const accessToken = jwtUtils.generateAccessToken ({username:user.username, _id:user._id})
            const refreshToken = jwtUtils.generateRefreshToken ({username:user.username, _id:user._id})
            return {accessToken: accessToken, refreshToken: refreshToken}
        } else {
            throw new IncorrectPasswordError()
        }
    }
}

exports.logout = async function(userid){
    await jwtUtils.logout(userid)
}