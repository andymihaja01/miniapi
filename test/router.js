process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/miniapi-test';
process.env.DEBUG = ""

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('#root/app.js')
chai.use(chaiHttp)
// even if it's not used in the syntax should(object), must be called to not raise undefined access
let should = chai.should()

describe('Router test', () => {
    describe('/GET /', () => {
        it("it should return Hello, router is working!",  (done) => {
            chai.request(server)
                .get('/')
                .end((err,res) => {
                    res.should.have.status(200)
                    res.text.should.eql("Hello, router is working!")
                    done()
                })
        })
    })
})