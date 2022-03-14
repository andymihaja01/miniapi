const axios = require('axios')
const { FACTORY_URL} = require("#root/config.js")

exports.queueOrder = function(order){
    return new Promise((resolve, reject) => {
        axios
        .post(`${FACTORY_URL}/order/queueOrder`, order)
        .then(res => {
            resolve(res)
        })
        .catch(error => {
            reject(error)
        })
    })
}