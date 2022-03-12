const User = require("#models/user.js")
const { default: mongoose } = require("mongoose")
async function createUser(username, passwordHash, salt, info){
    const user = new User({username, passwordHash, salt, info})
    await user.save()
    const userObject = user.toObject()
    return {_id:userObject._id, username:userObject.username, info:userObject.info}
}

/**
 * returns the user with salt and passwordhash
 */
async function getUserByUserName(username){
    const user = await User.findOne({username}).exec()
    return user;
}

/**
 *  Finds the user by id , userId should be a string
 * @param {string} userId 
 * @returns 
 */
async function findById(userId){
    const user = await User.findOne({_id: mongoose.Types.ObjectId(userId)}).select("-passwordHash -salt").exec()
    return user;
}

module.exports = {
    createUser,
    getUserByUserName,
    findById
}