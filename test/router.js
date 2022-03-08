process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/postscrudjwt-test';
process.env.DEBUG = ""

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('#root/app.js')
chai.use(chaiHttp)
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