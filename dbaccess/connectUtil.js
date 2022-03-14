const mongoose = require("mongoose")
const { DATABASE_URL } = require("#root/config.js")


/**
 * Connect with support for promise based url
 * @param {urlPromise} url 
 */
class SingleConnection{
    constructor(){

    }
    /**
     * 
     * @param {Promise<String>|String} url 
     * @returns 
     */
    async connect(url=null){
        if(this.connectPromise != undefined){
            return this.connectPromise
        } else {
            this.connectPromise = new Promise(async (resolve, reject) =>{
                let urlToConnectTo = DATABASE_URL
                if(url != null){
                    urlToConnectTo = await url
                }
                mongoose.connect(urlToConnectTo, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }).then(() => {
                    resolve(true)
                    console.log(`Connected to database at ${urlToConnectTo}`)
                }).catch((error) => reject(error))
            })
            return this.connectPromise
        }
    }

    disconnect() {
        return mongoose.connection.close();
    }
}

const singleConnectionInstance = new SingleConnection()

module.exports = {
    singleConnectionInstance
}