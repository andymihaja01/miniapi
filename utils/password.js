const crypto = require("crypto")
function makeSalt(length = 16){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') 
            .slice(0,length);
};
exports.makeSalt = makeSalt


function hash (password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};
exports.hash = hash

exports.saltHash = function(password){
    return hash(password,makeSalt()) 
}

exports.testPassword = function(password, hashedPassword, salt){
    return hash(password,salt).passwordHash == hashedPassword
}