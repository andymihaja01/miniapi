class CustomError extends Error{
    constructor(message) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}

class UserNotFoundError extends CustomError{
    constructor(status){
        super(`Incorrect Order Status, found ${status} instead of 'QUEUD' | 'IN PROGRESS' | 'READY FOR DELIVERY'`)
    }
}

module.exports = UserNotFoundError