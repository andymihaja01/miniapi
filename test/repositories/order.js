const sinon = require("sinon");
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
// Server is included so that it connects to the database
const server = require('#root/app.js');
const OrderRepository = require("#repositories/orderRepository.js");
const Order = require("#models/order.js");
const User = require("#models/user.js");
const Product = require("#models/product.js");
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.use(require('chai-things'));
chai.should()



describe('Order repository test', () => {
    it('it should fix the products ids in the orders' , () => {
        const fakeOrder = {
            products:[
                {
                    productId: "622f27b26a76a828b29b040b"
                },
                {
                    productId: "622f27b26a76a828b29b040a"
                }
            ]
        }
        OrderRepository.fixOrderIds(fakeOrder)
        fakeOrder.products.should.all.have.property("productId")
        fakeOrder.products.should.all.satisfy((product) => typeof product.productId !== String)
    })
    it('it should create an order', async () => {
        const fakeUser = await new User({
            username:faker.name.firstName(),
            salt:faker.internet.password(),
            passwordHash:faker.internet.password()
            
        }).save()
        const fakeProduct = await new Product({
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }).save()
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            customer: String(fakeUser._id),
            products: [
                {
                    productId:String(fakeProduct._id),
                    serialNumber:null,
                    isFigure:fakeProduct.isFigure,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
            discount:0,
            shippingInfo:{
                address:"new york"
            },
            status:'QUEUED',
            orderDate: nowDate
        }
        const savedOrder = await OrderRepository.createOrder(fakeOrder)  
        savedOrder.should.have.property("_id")
        savedOrder.should.have.property("customer")
        savedOrder.customer.should.eql(fakeOrder.customer)
        savedOrder.should.have.property("shippingInfo")
        savedOrder.shippingInfo.should.have.property("address")
        savedOrder.shippingInfo.address.should.eql(fakeOrder.shippingInfo.address)
        savedOrder.should.have.property("discount")
        savedOrder.discount.should.eql(fakeOrder.discount)
        savedOrder.should.have.property("orderDate")
        savedOrder.orderDate.should.eql(fakeOrder.orderDate)
        savedOrder.products.should.eql(fakeOrder.products)
        return true
    })
    it('it should get an order by id', async () => {
        const fakeUser = await new User({
            username:faker.name.firstName(),
            salt:faker.internet.password(),
            passwordHash:faker.internet.password()
            
        }).save()
        const fakeProduct = await new Product({
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }).save()
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            customer: String(fakeUser._id),
            products: [
                {
                    productId:String(fakeProduct._id),
                    serialNumber:null,
                    isFigure:fakeProduct.isFigure,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
            discount:0,
            shippingInfo:{
                address:"new york"
            },
            status:'QUEUED',
            orderDate: nowDate
        }
        const savedOrder = await new Order(fakeOrder).save()  
        const order = await OrderRepository.getOrderById(String(savedOrder._id))
        order.should.exist
        delete order._id
        delete order.__v
        order.should.eql(fakeOrder)
        return true
    })
    it('it should update an order by id', async () => {
        const fakeUser = await new User({
            username:faker.name.firstName(),
            salt:faker.internet.password(),
            passwordHash:faker.internet.password()
            
        }).save()
        const fakeProduct = await new Product({
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }).save()
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            customer: String(fakeUser._id),
            products: [
                {
                    productId:String(fakeProduct._id),
                    serialNumber:null,
                    isFigure:fakeProduct.isFigure,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
            discount:0,
            shippingInfo:{
                address:"new york"
            },
            status:'QUEUED',
            orderDate: nowDate
        }
        const savedOrder = await new Order(fakeOrder).save()  
        const updatedFakeOrder = {
            customer: String(fakeUser._id),
            products: [
                {
                    productId:String(fakeProduct._id),
                    serialNumber:"NEW SN",
                    isFigure:fakeProduct.isFigure,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice + 20,
                }
            ],
            discount:0.1,
            shippingInfo:{
                address:"new york"
            },
            status:'IN PROGRESS',
            orderDate: nowDate
        }
        const order = await OrderRepository.updateOrderById(String(savedOrder._id), updatedFakeOrder)
        order.should.exist
        delete order._id
        delete order.__v
        order.should.eql(updatedFakeOrder)
        return true
    })
    it('it should update an order status by id', async () => {
        const fakeUser = await new User({
            username:faker.name.firstName(),
            salt:faker.internet.password(),
            passwordHash:faker.internet.password()
            
        }).save()
        const fakeProduct = await new Product({
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }).save()
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            customer: String(fakeUser._id),
            products: [
                {
                    productId:String(fakeProduct._id),
                    serialNumber:null,
                    isFigure:fakeProduct.isFigure,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
            discount:0,
            shippingInfo:{
                address:"new york"
            },
            status:'QUEUED',
            orderDate: nowDate
        }
        const savedOrder = await new Order(fakeOrder).save()  
        const orderInProgress = await OrderRepository.updateOrderStatusById(String(savedOrder._id), "IN PROGRESS")
        orderInProgress.should.exist
        orderInProgress.should.have.property("status")
        orderInProgress.status.should.eql("IN PROGRESS")
        const orderReady = await OrderRepository.updateOrderStatusById(String(savedOrder._id), "READY FOR DELIVERY")
        orderReady.should.exist
        orderReady.should.have.property("status")
        orderReady.status.should.eql("READY FOR DELIVERY")
        return true
    })
    it('it should not throw an error with a valid status', async () => {
        OrderRepository.checkOrderStatus('QUEUED')
        OrderRepository.checkOrderStatus('IN PROGRESS')
        OrderRepository.checkOrderStatus('READY FOR DELIVERY')
    })
    it('it should throw an error with an invalid status', async () => {
        (() => OrderRepository.checkOrderStatus('not valid')).should.throw()
    })
})

afterEach(function () {
    sinon.restore();
});