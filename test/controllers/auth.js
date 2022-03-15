
const sinon = require("sinon");
const mongoose = require("mongoose")
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
const server = require('#root/app.js');
const userService = require("#services/user.js");
const { UserNotFoundError, IncorrectPasswordError } = require("#errors/errors.js");
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.should()

describe('Auth controller routes test', () => {
    describe("/POST /auth/register" ,() => {
        const fakeUser = {
            username:faker.internet.userName, 
            password:faker.internet.password,
            info:faker.address.streetAddress
        } 
        it("it should create a new User and return tokens",  (done) => {
            const userServiceCreateStub = sinon.stub(userService,"createUser").returns({ username: fakeUser.username, info:fakeUser.info})
            chai.request(server)
                .post('/auth/register')
                .send(fakeUser)
                .end((err,res) => {
                    res.should.have.status(201)
                    userServiceCreateStub.calledOnce.should.be.true
                    done()
                })
        })
    })
    describe("/POST /auth/login" ,() => {
        it("it should return an accessToken and a refreshToken",  (done) => {
            const fakeUser = {
                username:faker.internet.userName, 
                password:faker.internet.password
            } 
            const fakeToken = {
                accesToken: faker.datatype.uuid(),
                refreshToken: faker.datatype.uuid(),
            }
            const userServiceLoginStub = sinon.stub(userService,"login").returns({ accesToken: fakeToken.accesToken, refreshToken:fakeToken.refreshToken})
            chai.request(server)
                .post('/auth/login')
                .send(fakeUser)
                .end((err,res) => {
                    res.should.have.status(200)
                    res.body.should.have.property("accesToken")
                    res.body.accesToken.should.eql(fakeToken.accesToken)
                    res.body.should.have.property("refreshToken")
                    res.body.refreshToken.should.eql(fakeToken.refreshToken)
                    userServiceLoginStub.calledOnce.should.be.true
                    done()
                })
        })
        it("it should return a 404 status",  (done) => {
            const fakeUser = {
                username:faker.internet.userName, 
                password:faker.internet.password
            } 
            const userServiceLoginStub = sinon.stub(userService,"login").throws(new UserNotFoundError)
            chai.request(server)
                .post('/auth/login')
                .send(fakeUser)
                .end((err,res) => {
                    res.should.have.status(404)
                    userServiceLoginStub.calledOnce.should.be.true
                    done()
                })
        })
        it("it should return a 401 status with wrong password",  (done) => {
            const fakeUser = {
                username:faker.internet.userName, 
                password:faker.internet.password
            } 
            const userServiceLoginStub = sinon.stub(userService,"login").throws(new IncorrectPasswordError)
            chai.request(server)
                .post('/auth/login')
                .send(fakeUser)
                .end((err,res) => {
                    res.should.have.status(401)
                    userServiceLoginStub.calledOnce.should.be.true
                    done()
                })
        })
        it("it should return a 500 status",  (done) => {
            const fakeUser = {
                username:faker.internet.userName, 
                password:faker.internet.password
            } 
            const userServiceLoginStub = sinon.stub(userService,"login").throws(new Error)
            chai.request(server)
                .post('/auth/login')
                .send(fakeUser)
                .end((err,res) => {
                    res.should.have.status(500)
                    userServiceLoginStub.calledOnce.should.be.true
                    done()
                })
        })
    })
})
afterEach(function () {
    sinon.restore();
});