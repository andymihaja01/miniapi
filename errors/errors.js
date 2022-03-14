class CustomError extends Error{
    constructor(message) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}

class UserNotFoundError extends CustomError{
    constructor(){
        super("User was not found.")
    }
}


class IncorrectPasswordError extends CustomError{
    constructor(){
        super("Incorrect password.")
    }
}

class InvalidOrderError extends CustomError{
    constructor(){
        super("Something is wrong with the provided order.")
    }
}

class ProductNotFoundError extends CustomError{
    constructor(productId){
        super(`Cant't find product with id ${productId}`)
    }
}

class MissingProductError extends CustomError{
    constructor(productId){
        super(`The product ${productId} was not assigned a serial number.`)
    }
}


module.exports = {
    UserNotFoundError,
    IncorrectPasswordError,
    ProductNotFoundError,
    InvalidOrderError,
    MissingProductError
}