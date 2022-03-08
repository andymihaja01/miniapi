const passwordUtils = require("#utils/password.js")
const jwtUtils = require("#utils/jwt.js")
const User = require("#models/user.js")

exports.register = async(req,res) => { 
    const {username, password} = req.body
    const {passwordHash, salt} = passwordUtils.saltHash(password)
    const user = new User({username, passwordHash, salt})
    await user.save()
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
    const user = await User.findOne({username:req.body.username}).exec()

    if(user == null) {
        res.status(404).send("User does not exist!")
    } else {
        let providedPassword = req.body.password
        if(passwordUtils.testPassword(providedPassword, user.passwordHash, user.salt)){
            const accessToken = jwtUtils.generateAccessToken ({user:user.username})
            const refreshToken = jwtUtils.generateRefreshToken ({user:user.username})
            res.send({accessToken: accessToken, refreshToken: refreshToken})
        } else {
            res.status(401).send("Password Incorrect!")
        }
    }
}

exports.logout = async  (req,res)=>{
    await jwtUtils.logout({user:req.user.user})
    res.status(204).send("Logged out!")
}

exports.protected = (req,res) => {
    res.send({user:req.user, message:"This is a protected route"})
}