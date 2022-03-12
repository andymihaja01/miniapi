const express = require('express')
const morgan = require('morgan');
const mongoose = require("mongoose")
const { DATABASE_URL , PORT, NODE_ENV} = require("./config")
const app = express()
const routes = require("./routes")
const debug = require("debug")("server")
app.use(express.json())

if(NODE_ENV !== "test"){
    app.use(morgan('tiny'));
}

app.use('/',routes)

mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    debug("Database connected!")
})

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
    mongoose.connection.close();
    server.close();

}

module.exports = server