process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/postscrudjwt-test';
process.env.DEBUG = ""

const sinon = require("sinon");
const { faker } = require('@faker-js/faker');
const tokenRepository = require("#repositories/tokenRepository.js")
const tokenService = require("#services/token.js")
let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('#root/app.js');
chai.use(chaiHttp)
let should = chai.should()


describe('Auth test', () => {
    describe('Token Repository', () => {
        const fakeToken = {
            key: faker.datatype.uuid(),
            value: faker.datatype.uuid()
        }
        it("it should save a token",  (done) => {
            const token = tokenRepository.storeValue(fakeToken.key, fakeToken.value)
            token.should.be.a('object')
            token.should.have.property('key')
            token.key.should.eql(fakeToken.key)
            token.should.have.property('value')
            token.value.should.eql(fakeToken.value)
            done()
        })
        it("it should have a token",  (done) => {
            const hasToken = tokenRepository.hasKey(fakeToken.key)
            hasToken.should.be.a('boolean')
            hasToken.should.eql(true)
            done()
        })
        it("it should get a token",  (done) => {
            const token = tokenRepository.getValue(fakeToken.key)
            token.should.be.a('string')
            token.should.eql(fakeToken.value)
            done()
        })
        it("it should delete a token",  (done) => {
            const deleteToken = tokenRepository.deleteKey(fakeToken.key)
            deleteToken.should.be.a('boolean')
            deleteToken.should.eql(true)
            done()
        })
        it("it should not have a deleted token",  (done) => {
            const hasToken = tokenRepository.hasKey(fakeToken.key)
            hasToken.should.be.a('boolean')
            hasToken.should.eql(false)
            done()
        })
        it("it should not delete an already deleted token", (done) => {
            const deleteToken = tokenRepository.deleteKey(fakeToken.key)
            deleteToken.should.be.a('boolean')
            deleteToken.should.eql(false)
            done()
        })
    })
    describe('Token service', async() => {
        const fakeToken = {
            key: faker.datatype.uuid(),
            value: faker.datatype.uuid()
        }
        it("it should store a token",  async() => {
            const stub = sinon.stub(tokenRepository, "storeValue").returns(fakeToken.value)
            const token = await tokenService.storeToken(fakeToken.key, fakeToken.value)
            stub.calledOnce.should.be.true
            token.should.eql(fakeToken.value)
            return true
        })
        it("it should have a token",  async() => {
            const stub = sinon.stub(tokenRepository, "getValue").withArgs(String(fakeToken.key)).returns(String(fakeToken.value))
            const hasToken = await tokenService.hasToken(fakeToken.key, fakeToken.value)
            stub.calledOnce.should.be.true
            hasToken.should.eql(true)
            return true
        })
        it("it should have a user", async() => {
            const stub = sinon.stub(tokenRepository,"hasKey").withArgs(String(fakeToken.key)).returns(true)
            const hasUser = await tokenService.hasUser(fakeToken.key)
            stub.calledOnce.should.be.true 
            hasUser.should.eql(true)
        })
        it("it should remove a token", async() => {
            const stub = sinon.stub(tokenRepository,"deleteKey").withArgs(String(fakeToken.key)).returns(true)
            const keyDeleted = await tokenService.removeToken(fakeToken.key)
            stub.calledOnce.should.be.true 
            keyDeleted.should.eql(true)
        })
        it("it should not remove a token", async() => {
            const stub = sinon.stub(tokenRepository,"deleteKey").withArgs(String(fakeToken.key)).returns(false)
            const keyDeleted = await tokenService.removeToken(fakeToken.key)
            stub.calledOnce.should.be.true 
            keyDeleted.should.eql(false)
        })
        it("it should not have a token", async() => {
            const valueNotFakeToken = String(fakeToken.value)+"somerandomthing"
            const stub = sinon.stub(tokenRepository, "getValue").withArgs(String(fakeToken.key)).returns(valueNotFakeToken)
            const hasToken = await tokenService.hasToken(fakeToken.key, fakeToken.value)
            stub.calledOnce.should.be.true
            hasToken.should.eql(false)
            return true
        })
    })
})
afterEach(function () {
    sinon.restore();
});