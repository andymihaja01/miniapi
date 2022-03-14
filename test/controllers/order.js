const mongoose = require("mongoose")
let chai = require('chai')
const sinon = require("sinon")
chai.use(require('chai-things'));
const {useMiddlewareStub, fakedMiddlewareUser, restoreMiddlewareStub} = require("#root/testHelpers/fakeAuthMiddleware.js") 
const OrderService = require("#services/order.js")
let chaiHttp = require('chai-http')
let server = require('#root/app.js')
chai.use(chaiHttp)
let should = chai.should()
beforeEach(() => {
    useMiddlewareStub()
})
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
        it("it should not create an order with empty products",  (done) => {
            const fakeOrder = {
                products: [
                ]
            }
            chai.request(server)
              .post('/order/createOrder')
              .send(fakeOrder)
              .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('details');
                    res.body.error.details.should.contain.an.item.with.property('type','array.min');
                done();
              });
        })
        it("it should not create an order without auth",  (done) => {
            const fakeOrder = {
                products: [
                    {
                        productId:"fake product id",
                    }
                ]
            }
            restoreMiddlewareStub()
            chai.request(server)
              .post('/order/createOrder')
              .send(fakeOrder)
              .end((err, res) => {
                    res.should.have.status(401);
                    done();
              });
        })
        it("it should create a normally formed order",  (done) => {
            const fakeOrder = {
                products: [
                    {
                        productId:"fake product id",
                    }
                ]
            }
            const fakeOrderFull = {
                shippingInfo:{
                    address:"new york"
                },
                customer:fakedMiddlewareUser._id,
                products: [
                    {
                        productId:"fake product id",
                    }
                ]
            }
            const fakeProduct = {
                name: "MiniFigure",
                unitPrice: 12.5,
                isFigure: true
            }
            const nowDate = new Date(Date.now())
            const updatedFakeOrder = {
                _id:"testorder",
                customer: String(fakedMiddlewareUser._id),
                products: [
                    {
                        productId:String(fakeProduct._id),
                        serialNumber:"NEW SN",
                        isFigure:fakeProduct.isFigure,
                        originalUnitPrice: fakeProduct.unitPrice,
                        finalUnitPrice: fakeProduct.unitPrice,
                    }
                ],
                discount:0.1,
                shippingInfo:{
                    address:"new york"
                },
                status:'IN PROGRESS',
                orderDate: nowDate
            }
            const orderCreateStub = sinon.stub(OrderService,"createOrder").returns(fakeOrderFull)
            const orderUpdateSerialStub = sinon.stub(OrderService,"updateSerialNumbersAndStatus").returns(updatedFakeOrder)
            chai.request(server)
              .post('/order/createOrder')
              .send(fakeOrder)
              .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.eql(fakeOrderFull)
                    orderCreateStub.calledOnce.should.be.true
                    orderCreateStub.restore()
                    orderUpdateSerialStub.restore()
                    done();
              });
        })
    })
})
afterEach(() => {
    restoreMiddlewareStub()
})
after((done) => {
      mongoose.connection.close(done);
});