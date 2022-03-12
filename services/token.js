const tokenRepository = require("#repositories/tokenRepository.js")

/**
 * Stores a token
 * @param {object|string} id - the key
 * @param {object|string} token - the value to store
 * @returns 
 */
exports.storeToken = async function(id,token){
    let stringId = String(id)
    let stringToken = String(token)
    return tokenRepository.storeValue(stringId,stringToken)
}

exports.hasToken = async function(id, token){
    let value = tokenRepository.getValue(String(id))
    token = String(token)
    return value == token
}

exports.hasUser = async function(id){
    return tokenRepository.hasKey(String(id))
}

exports.removeToken = async function(id){
    return await tokenRepository.deleteKey(String(id))
}