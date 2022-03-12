const crypto = require("crypto")
exports.makeSalt = function(length = 16){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') 
            .slice(0,length);
};


exports.hash = function(password, salt){
    console.log("CALLED HASH")
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

exports.saltHash = function(password){
    return module.exports.hash(password,module.exports.makeSalt()) 
}

exports.testPassword = function(password, hashedPassword, salt){
    return hash(password,salt).passwordHash == hashedPassword
}