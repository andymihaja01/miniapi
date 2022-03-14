const sinon = require("sinon");
const chai = require('chai')
const axios = require('axios')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
const MinifactoryService = require("#services/minifactory.js");
const {FACTORY_URL } = require("#root/config.js")
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.use(require('chai-things'));
const should = chai.should()

describe("MiNiFactory Service test", () => {
    it("it should queue an order", async () => {
        const fakeOrder = {
                _id:"test",
                products:[
                    {
                        productId:"asd",
                        isFigure:true,
                        serialNumber:null
                    }
                 ]
            
        }
        const fakeFactoryReply = {
            "_id": "test",
            "products": [
              {
                "productId": "asd",
                "isFigure": true,
                "serialNumber": "84d020b7706bbcd7efaca1848ae17a0a3d8d277a45a0ec9bbdfb9df0e516abd6728c3328eeb22715a7f0383e9cf00a1926d3a2bbceafa40b24e6b142970e0e6a"
              }
            ],
            "status": "IN PROGRESS",
            "statusCode": 1
          }
        const axiosPostStub = sinon.stub(axios, "post").resolves(fakeFactoryReply)
        const queuedOrder = await MinifactoryService.queueOrder(fakeOrder)
        axiosPostStub.calledOnce.should.be.true
        queuedOrder.should.eql(fakeFactoryReply)
        return true
    })
})