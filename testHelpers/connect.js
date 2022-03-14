const { singleConnectionInstance } = require('#root/dbaccess/connectUtil.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoServer = MongoMemoryServer.create();

let urlPromise = new Promise((resolve,reject) => {
    mongoServer.then((dbserver) => {
        const dbURI = dbserver.getUri()
        let finalUrl = `${dbURI}miniapi-test`
        process.env.DATABASE_URL = finalUrl;
        resolve(finalUrl)
    })
})

singleConnectionInstance.connect(urlPromise).then(() => {})
