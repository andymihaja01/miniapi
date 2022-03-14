const express = require('express')
const morgan = require('morgan');
const { PORT, NODE_ENV } = require("./config");
const { singleConnectionInstance } = require('#root/dbaccess/connectUtil.js');
const app = express()
const routes = require("./routes")
const debug = require("debug")("server")
app.use(express.json())
singleConnectionInstance.connect().then(() => {
    debug("Database connected!")
})
if(NODE_ENV !== "test"){
    app.use(morgan('tiny'));
}

app.use('/',routes)



const server = app.listen(PORT, () => {
    debug(`App is listening on port ${PORT}`)
})

process.on('SIGINT', function() {
    exitCleanup()
});

process.on('SIGTERM', function() {
    exitCleanup()
});

function exitCleanup(){
    singleConnectionInstance.disconnect()
    server.close();

}

module.exports = server