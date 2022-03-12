const tokenSingleton = require("#repositories/utils/tokenSingleton.js")

function storeValue(key,value){
    tokenSingleton.set(key,value)
    return {key,value}
}

function getValue(key){
    return tokenSingleton.get(key)
}

function hasKey(key){
    return tokenSingleton.has(key)
}

function deleteKey(key){
    return tokenSingleton.delete(key)
}

module.exports = {
    storeValue,
    getValue,
    hasKey,
    deleteKey
}