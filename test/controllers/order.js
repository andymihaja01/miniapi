const mongoose = require("mongoose")
let chai = require('chai')
const sinon = require("sinon")
chai.use(require('chai-things'));
const {useMiddlewareStub, fakedMiddlewareUser, restoreMiddlewareStub} = require("#root/testHelpers/fakeAuthMiddleware.js") 
const OrderService = require("#services/order.js")
const MinifactoryService = require("#services/minifactory.js")
let chaiHttp = require('chai-http')
let server = require('#root/app.js')
chai.use(chaiHttp)
let should = chai.should()
beforeEach(() => {
    useMiddlewareStub()
})
describe('Order controller routes test', () => {
    describe('/POST /order/createOrder', () => {
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
                isFigure: true,
                isFamilyPack: false
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
                        isFamilyPack:fakeProduct.isFamilyPack,
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
            const minifactoryQueueStub = sinon.stub(MinifactoryService,"queueOrder").resolves({})
            const orderUpdateSerialStub = sinon.stub(OrderService,"updateSerialNumbersAndStatus").returns(updatedFakeOrder)
            chai.request(server)
              .post('/order/createOrder')
              .send(fakeOrder)
              .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.eql(fakeOrderFull)
                    orderCreateStub.calledOnce.should.be.true
                    minifactoryQueueStub.calledOnce.should.be.true
                    orderUpdateSerialStub.calledOnce.should.be.true
                    minifactoryQueueStub.restore()
                    orderCreateStub.restore()
                    orderUpdateSerialStub.restore()
                    done();
              });
        })
    })
    describe("/POST /order/notifyOrderStatus/:orderId", () => {
        it("it should update the order status", (done) => {
            const fakeOrder = {
                orderId: "testOrderId",
                status: "READY FOR DELIVERY"
            }
            useMiddlewareStub()
            const orderServiceUpdateStatusStub = sinon.stub(OrderService, "updateOrderStatusById").returns(fakeOrder)
            chai.request(server)
                .post(`/order/notifyOrderStatus/${fakeOrder.orderId}`)
                .send({status:fakeOrder.status})
                .end((err,res) => {
                    res.should.have.status(200)
                    orderServiceUpdateStatusStub.calledOnce.should.be.true
                    orderServiceUpdateStatusStub.getCall(0).args[0].should.eql(fakeOrder.orderId)
                    orderServiceUpdateStatusStub.getCall(0).args[1].should.eql(fakeOrder.status)
                    restoreMiddlewareStub()
                    done()
                })
        })
        it("it should not update an order with incorrect status", (done) => {
            const fakeOrder = {
                orderId: "testOrderId",
                status: "TOTALLY INCORRECT STATUS"
            }
            useMiddlewareStub()
            chai.request(server)
                .post(`/order/notifyOrderStatus/${fakeOrder.orderId}`)
                .send({status:fakeOrder.status})
                .end((err,res) => {
                    res.should.have.status(400)
                    restoreMiddlewareStub()
                    done()
                })
        })
    })
})
afterEach(() => {
    restoreMiddlewareStub()
})
after((done) => {
      mongoose.connection.close(done);
});