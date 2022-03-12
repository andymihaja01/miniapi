class CustomError extends Error{
    constructor(message) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}

class UserNotFoundError extends Error{
    constructor(){
        super("User was not found.")
    }
}


class IncorrectPasswordError extends Error{
    constructor(){
        super("Incorrect password.")
    }
}

module.exports = {
    UserNotFoundError,
    IncorrectPasswordError
}