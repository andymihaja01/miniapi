const sinon = require("sinon")
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
const server = require('#root/app.js');
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.should()

describe('Test the mini process', () => {
    
})