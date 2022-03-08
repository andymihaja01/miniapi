// simple map based token implementation
const tokens = new Map()
/**
 * Stores a token
 * @param {object|string} id - the key
 * @param {object|string} token - the value to store
 * @returns 
 */
exports.storeToken = async function(id,token){
    let stringId = JSON.stringify(id)
    let stringToken = JSON.stringify(token)
    await tokens.set(stringId,stringToken)
}

exports.hasToken = async function(id, token){
    return tokens.get(JSON.stringify(id)) == JSON.stringify(token)
}

exports.hasUser = async function(id){
    return tokens.has(JSON.stringify(id))
}

exports.removeToken = async function(id){
    await tokens.delete(JSON.stringify(id))
}