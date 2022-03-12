process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/postscrudjwt-test';
process.env.DEBUG = ""

const sinon = require("sinon");
const passwordUtil = require("#utils/password.js")
const jwt = require("jsonwebtoken")
const { faker } = require('@faker-js/faker');
const tokenRepository = require("#repositories/tokenRepository.js")
const tokenService = require("#services/token.js")
const jwtUtil = require("#utils/jwt.js")
let chai = require('chai')
var chaiAsPromised = require("chai-as-promised");
let chaiHttp = require('chai-http')
let server = require('#root/app.js');
chai.use(chaiHttp)
chai.use(chaiAsPromised);
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
    describe('JWT util', async() => {
        const randomUser = faker.helpers.createCard()
        randomUser.id = faker.datatype.uuid()
        const randomJwtReturn = faker.datatype.uuid()
        it("it should generate an access token", async() => {
            const stub = sinon.stub(jwt, "sign").returns(randomJwtReturn)
            let accessToken = jwtUtil.generateAccessToken(randomUser)
            stub.calledOnce.should.be.true
            accessToken.should.eql(randomJwtReturn)
            return true
        })
        it("it should generate and store a refresh token", async() => {
            const stub = sinon.stub(jwt, "sign").returns(randomJwtReturn)
            const tokenServiceStub = sinon.stub(tokenService, "storeToken").returns({key:"anything", value:"anything"})
            let refreshToken = jwtUtil.generateRefreshToken(randomUser)
            stub.calledOnce.should.be.true
            tokenServiceStub.calledOnce.should.be.true
            refreshToken.should.eql(randomJwtReturn)
            return true
        })
        it("it should generate new tokens when using refresh token", async() => {
            const tokenServiceHasStub = sinon.stub(tokenService, "hasToken").returns(true)
            const tokenServiceRemoveStub = sinon.stub(tokenService, "removeToken").returns(true)
            const tokenServiceStoreStub = sinon.stub(tokenService, "storeToken").returns(true)
            let oldRefreshToken = await jwtUtil.generateRefreshToken(randomUser)
            const result = await jwtUtil.refreshToken(oldRefreshToken)
            tokenServiceHasStub.calledOnce.should.be.true
            tokenServiceRemoveStub.calledOnce.should.be.true
            tokenServiceStoreStub.calledTwice.should.be.true
            result.should.be.a('object')
            result.should.have.property("accessToken")
            result.should.have.property("refreshToken")
            result.refreshToken.should.not.eql(oldRefreshToken)
            return true
        })
        it("it should logout", async() => {
            const tokenServiceHasStub = sinon.stub(tokenService, "hasUser").returns(true)
            const tokenServiceRemoveStub = sinon.stub(tokenService, "removeToken").returns(true)
            const loggedOut = await jwtUtil.logout(randomUser.id)
            tokenServiceHasStub.calledOnce.should.be.true
            tokenServiceRemoveStub.calledOnce.should.be.true
            loggedOut.should.be.true
            return true
        })
        it("it should not generate refresh token with invalid refresh token", async() => {
            const tokenServiceHasStub = sinon.stub(tokenService, "hasToken").returns(false)
            const tokenServiceStoreStub = sinon.stub(tokenService, "storeToken").returns(true)
            let refreshToken = await jwtUtil.generateRefreshToken(randomUser)
            tokenServiceStoreStub.calledOnce.should.be.true
            jwtUtil.refreshToken(refreshToken).should.be.rejected
            tokenServiceHasStub.calledOnce.should.be.true
            return true
        })
        it("it should not logout with invalid userId", async() => {
            const tokenServiceHasStub = sinon.stub(tokenService, "hasUser").returns(false)
            jwtUtil.logout(randomUser.id).should.be.rejected
            tokenServiceHasStub.calledOnce.should.be.true            
            return true
        })
    })
    describe('password util', async() => {
        const password1 = faker.internet.password()
        const password2 = faker.internet.password()
        it("it should generate a salt", () => {
            const salt = passwordUtil.makeSalt()
            salt.should.exist
            salt.should.be.not.empty
        })
        it("it should generate a hash", () => {
            const salt = passwordUtil.makeSalt()
            const hash = passwordUtil.hash(password1, salt)
            hash.should.have.property("salt")
            hash.should.have.property("passwordHash")
            hash.salt.should.eql(salt)
            hash.passwordHash.should.exist
            hash.passwordHash.should.be.not.empty

        })
        it("it should generate the same hash with the same password and salt", () => {
            const salt = passwordUtil.makeSalt()
            const hash1 = passwordUtil.hash(password1, salt)
            const hash2 = passwordUtil.hash(password1, salt)
            hash1.salt.should.eql(salt)
            hash1.salt.should.eql(hash2.salt)
            hash1.passwordHash.should.eql(hash2.passwordHash)
        })
        it("it should generate different hash with the same password and different salt", () => {
            const salt1 = passwordUtil.makeSalt()
            const salt2 = passwordUtil.makeSalt()
            salt1.should.not.eql(salt2)
            const hash1 = passwordUtil.hash(password1, salt1)
            const hash2 = passwordUtil.hash(password1, salt2)
            hash1.salt.should.eql(salt1)
            hash2.salt.should.eql(salt2)
            hash1.passwordHash.should.not.eql(hash2.passwordHash)
        })
        it("it should generate different hash", () => {
            const salt1 = passwordUtil.makeSalt()
            const salt2 = passwordUtil.makeSalt()
            salt1.should.not.eql(salt2)
            const hash1 = passwordUtil.hash(password1, salt1)
            const hash2 = passwordUtil.hash(password2, salt2)
            hash1.salt.should.eql(salt1)
            hash2.salt.should.eql(salt2)
            hash1.passwordHash.should.not.eql(hash2.passwordHash)
        })
        it("it should saltHash a password", () => {
            const fakeHash = { salt:"salt", passwordHash:"passwordHash"}
            const hashStub = sinon.stub(passwordUtil, "hash").returns(fakeHash)
            const makeSaltStub = sinon.stub(passwordUtil, "makeSalt").returns("salt")
            const hash = passwordUtil.saltHash(password1)
            makeSaltStub.calledOnce.should.be.true
            hashStub.calledOnce.should.be.true        
            hash.should.have.property("salt")
            hash.salt.should.eql(fakeHash.salt)            
            hash.should.have.property("passwordHash")            
            hash.passwordHash.should.eql(fakeHash.passwordHash)            
        })  
    })

})
afterEach(function () {
    sinon.restore();
});