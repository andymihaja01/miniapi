const axios = require('axios')
const { FACTORY_URL} = require("./config")

export function queueOrder(order){
    return new Promise((resolve, reject) => {
        axios
        .post(`${FACTORY_URL}/order/queueOrder`, order)
        .then(res => {
            resolve(res.data)
        })
        .catch(error => {
            reject(error)
        })
    })
}