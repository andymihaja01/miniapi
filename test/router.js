let chai = require('chai')
let chaiHttp = require('chai-http')
const server = require('#root/app.js')
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