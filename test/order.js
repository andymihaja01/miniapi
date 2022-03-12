process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/miniapi-test';
process.env.DEBUG = ""
const mongoose = require("mongoose")
let chai = require('chai')
chai.use(require('chai-things'));
let chaiHttp = require('chai-http')
let server = require('#root/app.js')
chai.use(chaiHttp)
let should = chai.should()

describe('Order test', () => {
     describe('/POST createOrder', () => {
        it("it should not create an empty order",  (done) => {
            let order = {
            }
            chai.request(server)
              .post('/order/createOrder')
              .send(order)
              .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('details');
                    res.body.error.details.should.contain.an.item.with.property('type','any.required');
                done();
              });
        })
        it("it should not create an order with no minis",  (done) => {
            let order = {
                "profile":{
                    "email":"test@test.com"
                }
            }
            chai.request(server)
              .post('/order/createOrder')
              .send(order)
              .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('details');
                    res.body.error.details.should.contain.an.item.with.property('type','any.required');
                done();
              });
        })
        it("it should not create an order with no profile",  (done) => {
            let order = {
                "order":[{
                    "type":"mini"
                }]
            }
            chai.request(server)
              .post('/order/createOrder')
              .send(order)
              .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('details');
                    res.body.error.details.should.contain.an.item.with.property('type','any.required');
                done();
              });
        })
        it("it should create a normally formed order",  (done) => {
            let order = {
                order:[
                    {type:"mini"}
                ],
                profile:{
                    email:"test@test.com"
                }
            }
            chai.request(server)
              .post('/order/createOrder')
              .send(order)
              .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
              });
        })
    })
})

after((done) => {
      mongoose.connection.close(done);
});