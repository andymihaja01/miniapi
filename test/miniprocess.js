const sinon = require("sinon")
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
const {useMiddlewareStub, fakedMiddlewareUser, restoreMiddlewareStub} = require("#root/testHelpers/fakeAuthMiddleware.js") 
const server = require('#root/app.js');
const MinifactoryService = require("#services/minifactory.js")
const NotificationService = require("#services/notification.js")
const Product = require("#models/product.js")
const {FACTORY_URL} = require("#root/config.js")
const OrderRepository = require("#repositories/orderRepository.js")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.should()

// SETUP THE DATA FOR THE TEST
function setupData(){
    return new Promise( async (resolve,reject) => {
        let savedProducts = []
        const products = [
            {
                name:"MiNi Figure red",
                unitPrice: 15,
                isFigure: true,
                isFamilyPack:false
            },
            {
                name:"MiNi Figure green",
                unitPrice: 15,
                isFigure: true,
                isFamilyPack:false
            },
            {
                name:"MiNi Family Pack",
                unitPrice: 50,
                isFigure: false,
                isFamilyPack: true
            }
        ]
        savedProducts.push(await new Product(products[0]).save())
        savedProducts.push(await new Product(products[1]).save())
        savedProducts.push(await new Product(products[2]).save())
      resolve(savedProducts)
    })
}



beforeEach(() => {
    restoreMiddlewareStub()
})
describe('Test the mini process', () => {
    describe('Order process with 1 MiNi Figure', () => {
        let accessToken = null
        let savedProducts = null
        let orderId = null
        // this could be done in a hook
        it("populate database", async() => {
            savedProducts = await setupData()
            return true
        })
        it("it should create a profile", (done) => {
            chai.request(server)
                .post('/auth/register')
                .send({
                    username:"minitester",
                    password:"minipassword",
                    info:{ 
                        address:"new york"
                    }
                })
                .end((err,res) => {
                    res.should.have.status(201)
                    done()
                })
        })
        it("it should connect as the profile", (done) => {
            chai.request(server)
            .post('/auth/login')
            .send({
                username:"minitester",
                password:"minipassword"
            })
            .end((err,res) => {
                res.should.have.status(200)
                res.body.should.have.a.property("accessToken")
                res.body.accessToken.should.exist
                accessToken = res.body.accessToken
                done()
            })
        })
        it("it should make an order with 1 MiNi Figure", (done) => {
            // stub the factory 
            const minifactorystub = sinon.stub(MinifactoryService,"queueOrder").callsFake((order) => {
                return new Promise((resolve,reject) => {
                    const orderCopy = JSON.parse(JSON.stringify(order))
                orderCopy.products.forEach((product) => product.serialNumber = faker.datatype.uuid()) 
                orderCopy.status = "IN PROGRESS"
                resolve(orderCopy)
                })
            })
            chai.request(server)
            .post('/order/createOrder')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(
             {
                shippingInfo:{
                    address:"new york"
                },
                products: [
                    {
                        quantity:1,
                        productId:String(savedProducts[0]._id),
                    }
                ]
            }
            )
            .end(async (err,res) => {
                res.should.have.status(200)
                res.body.should.have.property("_id")
                orderId = res.body._id
                res.body.should.have.property("status")
                res.body.status.should.eql("QUEUED")
                minifactorystub.restore()
                done()
            })
        })
        it("it should have marked the order as IN PROGRESS and give serial numbers to the products after short time", async() => {
            await new Promise((resolve,_) => setTimeout(() => resolve(true), 200))
            const currentOrder = await OrderRepository.getOrderById(orderId)
            currentOrder.should.have.property("status")
            currentOrder.status.should.eql("IN PROGRESS")
            currentOrder.should.have.property("products")
        })
        it("it should mark the order as good for delivery when notified by the factory, and notify the user", (done) => {
            const notificationSpy = sinon.spy(NotificationService,"notifyOrderDoneWithInvoice")
            chai.request(server)
            .post(`/order/notifyOrderStatus/${orderId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(
             {
               status:"READY FOR DELIVERY"
            }
            )
            .end(async (err,res) => {
                res.should.have.status(200)
                notificationSpy.calledOnce.should.be.true
                notificationSpy.restore()
                done()
            })
        })
    })
    describe('Order process with 50 MiNi Figure', () => {
        let accessToken = null
        let savedProducts = null
        let orderId = null
        // this could be done in a hook
        it("populate database", async() => {
            savedProducts = await setupData()
            return true
        })
        it("it should create a profile", (done) => {
            chai.request(server)
                .post('/auth/register')
                .send({
                    username:"minitester50",
                    password:"minipassword",
                    info:{ 
                        address:"new york"
                    }
                })
                .end((err,res) => {
                    res.should.have.status(201)
                    done()
                })
        })
        it("it should connect as the profile", (done) => {
            chai.request(server)
            .post('/auth/login')
            .send({
                username:"minitester50",
                password:"minipassword"
            })
            .end((err,res) => {
                res.should.have.status(200)
                res.body.should.have.a.property("accessToken")
                res.body.accessToken.should.exist
                accessToken = res.body.accessToken
                done()
            })
        })
        it("it should make an order with 50 MiNi Figure", (done) => {
            // stub the factory 
            const minifactorystub = sinon.stub(MinifactoryService,"queueOrder").callsFake((order) => {
                return new Promise((resolve,reject) => {
                    const orderCopy = JSON.parse(JSON.stringify(order))
                orderCopy.products.forEach((product) => product.serialNumber = faker.datatype.uuid()) 
                orderCopy.status = "IN PROGRESS"
                resolve(orderCopy)
                })
            })
            chai.request(server)
            .post('/order/createOrder')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(
             {
                shippingInfo:{
                    address:"new york"
                },
                products: [
                    {
                        quantity:50,
                        productId:String(savedProducts[0]._id),
                    }
                ]
            }
            )
            .end(async (err,res) => {
                res.should.have.status(200)
                res.body.should.have.property("_id")
                orderId = res.body._id
                res.body.should.have.property("status")
                res.body.status.should.eql("QUEUED")
                minifactorystub.restore()
                done()
            })
        })
        it("it should have a price discount on the MiNi figures", async() => {
            const currentOrder = await OrderRepository.getOrderById(orderId)
            currentOrder.should.have.property("products")
            currentOrder.products.should.have.lengthOf(1)
            currentOrder.products[0].should.have.property("originalUnitPrice")
            currentOrder.products[0].originalUnitPrice.should.eql(15)
            currentOrder.products[0].should.have.property("finalUnitPrice")
            currentOrder.products[0].finalUnitPrice.should.eql(9)
            return true
        })
        it("it should have marked the order as IN PROGRESS and give serial numbers to the products after short time", async() => {
            await new Promise((resolve,_) => setTimeout(() => resolve(true), 200))
            const currentOrder = await OrderRepository.getOrderById(orderId)
            currentOrder.should.have.property("customer")
            currentOrder.should.have.property("status")
            currentOrder.status.should.eql("IN PROGRESS")
            currentOrder.should.have.property("products")
        })
        it("it should mark the order as good for delivery when notified by the factory, notify the user, and the invoice should have the mini discounted marked on it", (done) => {
            const notificationSpy = sinon.spy(NotificationService,"notifyOrderDoneWithInvoice")
            chai.request(server)
            .post(`/order/notifyOrderStatus/${orderId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(
             {
               status:"READY FOR DELIVERY"
            }
            )
            .end(async (err,res) => {
                notificationSpy.calledOnce.should.be.true
                notificationSpy.restore()
                await (notificationSpy.firstCall.returnValue).should.eventually.have.property("miniFigureOverallDiscount",true)
                res.should.have.status(200)
                done()
            })
        })
    })
    describe('Order process with a family pack', () => {
        let accessToken = null
        let savedProducts = null
        let orderId = null
        // this could be done in a hook
        it("populate database", async() => {
            savedProducts = await setupData()
            return true
        })
        it("it should create a profile", (done) => {
            chai.request(server)
                .post('/auth/register')
                .send({
                    username:"minitester50",
                    password:"minipassword",
                    info:{ 
                        address:"new york"
                    }
                })
                .end((err,res) => {
                    res.should.have.status(201)
                    done()
                })
        })
        it("it should connect as the profile", (done) => {
            chai.request(server)
            .post('/auth/login')
            .send({
                username:"minitester50",
                password:"minipassword"
            })
            .end((err,res) => {
                res.should.have.status(200)
                res.body.should.have.a.property("accessToken")
                res.body.accessToken.should.exist
                accessToken = res.body.accessToken
                done()
            })
        })
        it("it should make an order with a family pack", (done) => {
            // stub the factory 
            const minifactorystub = sinon.stub(MinifactoryService,"queueOrder").callsFake((order) => {
                return new Promise((resolve,reject) => {
                    const orderCopy = JSON.parse(JSON.stringify(order))
                orderCopy.products.forEach((product) => product.serialNumber = faker.datatype.uuid()) 
                orderCopy.status = "IN PROGRESS"
                resolve(orderCopy)
                })
            })
            chai.request(server)
            .post('/order/createOrder')
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(
             {
                shippingInfo:{
                    address:"new york"
                },
                products: [
                    {
                        quantity:1,
                        productId:String(savedProducts[2]._id),
                    }
                ]
            }
            )
            .end(async (err,res) => {
                res.should.have.status(200)
                res.body.should.have.property("_id")
                orderId = res.body._id
                res.body.should.have.property("status")
                res.body.status.should.eql("QUEUED")
                minifactorystub.restore()
                done()
            })
        })
        it("it should have a 20% price discount on the overall order", async() => {
            const currentOrder = await OrderRepository.getOrderById(orderId)
            currentOrder.should.have.property("discount")
            currentOrder.discount.should.eql(0.2)
            return true
        })
        it("it should have marked the order as IN PROGRESS and give serial numbers to the products after short time", async() => {
            await new Promise((resolve,_) => setTimeout(() => resolve(true), 200))
            const currentOrder = await OrderRepository.getOrderById(orderId)
            currentOrder.should.have.property("status")
            currentOrder.status.should.eql("IN PROGRESS")
            currentOrder.should.have.property("products")
        })
        it("it should mark the order as good for delivery when notified by the factory, and notify the user", (done) => {
            const notificationSpy = sinon.spy(NotificationService,"notifyOrderDoneWithInvoice")
            chai.request(server)
            .post(`/order/notifyOrderStatus/${orderId}`)
            .set({ Authorization: `Bearer ${accessToken}` })
            .send(
             {
               status:"READY FOR DELIVERY"
            }
            )
            .end(async (err,res) => {
                notificationSpy.calledOnce.should.be.true
                notificationSpy.restore()
                res.should.have.status(200)
                done()
            })
        })
    })
})