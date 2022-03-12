const passwordUtils = require("#utils/password.js")
const jwtUtils = require("#utils/jwt.js")
const User = require("#models/user.js")
const userService = require("#services/user.js")
const { UserNotFoundError, IncorrectPasswordError } = require("#errors/errors.js")

exports.register = async(req,res) => { 
    const {username, password, info} = req.body
    let user = await userService.createUser(username, password, info)
    res.status(201).send(user)
}

exports.refreshToken = (req,res) => {
    try{
        const {accessToken, refreshToken} = jwtUtils.refreshToken(req.body.token)
        res.send({ accessToken, refreshToken})
    } catch(error){
        if(error.invalidToken){
            res.status(400).send("Refresh Token Invalid")
        } else { 
            res.status(500).send({message:"An error occured", error})
        }
    }

}

exports.login = async(req,res) => {
    try{
        const {username, password} = req.body
        const tokens = await userService.login(username, password)
        res.status(200).send(tokens)
    } catch(error){
        if(error instanceof UserNotFoundError){
            res.status(404).send(error.message)
        } else if(error instanceof IncorrectPasswordError){
            res.status(401).send(error.message)
        } else {
            res.status(500).send({message:"An error occured", error})
        }
    }
}

exports.logout = async  (req,res)=>{
    await jwtUtils.logout({user:req.user.id})
    res.status(204).send("Logged out!")
}

exports.protected = (req,res) => {
    res.send({user:req.user, message:"This is a protected route"})
}