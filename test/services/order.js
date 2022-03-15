const sinon = require("sinon");
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
// Server is included so that it connects to the database
const server = require('#root/app.js');
const OrderRepository = require("#repositories/orderRepository.js");
const ProductRepository = require("#repositories/productRepository.js");
const UserRepository = require("#repositories/userRepository.js");
const OrderService = require("#services/order.js");
const { InvalidOrderError, UserNotFoundError, ProductNotFoundError } = require("#errors/errors.js");
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.use(require('chai-things'));
const should = chai.should()



describe('Order service test', () => {
    it('it should not create an order with an incorrect customer' , async() => {
        const fakeUser = {
            _id: "testUser",
            username:faker.name.firstName(),
            info: {
                address: "new york"
            }
        }
        const fakeProduct ={
            _id: "testProduct",
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }
        const fakeOrder = {
            products: []
        }
        const userRepositoryFindStub = sinon.stub(UserRepository,"findById").returns(null)
        const productRepositoryFindStub = sinon.stub(ProductRepository,"getProductById").returns(fakeProduct)
        const orderRepositoryCreateStub = sinon.stub(OrderRepository,"createOrder").returnsArg(0)
        await OrderService.createOrder(fakeOrder, fakeUser._id).should.be.rejectedWith(UserNotFoundError) 
        return true
    })
    it('it should not create an order with empty products' , async() => {
        const fakeUser = {
            _id: "testUser",
            username:faker.name.firstName(),
            info: {
                address: "new york"
            }
        }
        const fakeProduct ={
            _id: "testProduct",
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }
        const fakeOrder = {
            products: []
        }
        const userRepositoryFindStub = sinon.stub(UserRepository,"findById").returns(fakeUser)
        const productRepositoryFindStub = sinon.stub(ProductRepository,"getProductById").returns(fakeProduct)
        const orderRepositoryCreateStub = sinon.stub(OrderRepository,"createOrder").returnsArg(0)
        await OrderService.createOrder(fakeOrder, fakeUser._id).should.be.rejectedWith(InvalidOrderError) 
        return true
    })
    it('it should not create an order with incorrect products' , async() => {
        const fakeUser = {
            _id: "testUser",
            username:faker.name.firstName(),
            info: {
                address: "new york"
            }
        }
        const fakeProduct ={
            _id: "testProduct",
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }
        const fakeOrder = {
            products: [
                {
                    productId:String(fakeProduct._id),
                }
            ]
        }
        const userRepositoryFindStub = sinon.stub(UserRepository,"findById").returns(fakeUser)
        const productRepositoryFindStub = sinon.stub(ProductRepository,"getProductById").returns(null)
        const orderRepositoryCreateStub = sinon.stub(OrderRepository,"createOrder").returnsArg(0)
        await OrderService.createOrder(fakeOrder, fakeUser._id).should.be.rejectedWith(ProductNotFoundError) 
        return true
    })
    it('it should create and fill an order', async () => {
        const fakeUser = {
            _id: "testUser",
            username:faker.name.firstName(),
            info: {
                address: "new york"
            }
        }
        const fakeProduct ={
            _id: "testProduct",
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }
        const fakeOrder = {
            products: [
                {
                    productId:String(fakeProduct._id),
                }
            ]
        }
        const userRepositoryFindStub = sinon.stub(UserRepository,"findById").returns(fakeUser)
        const productRepositoryFindStub = sinon.stub(ProductRepository,"getProductById").returns(fakeProduct)
        const orderRepositoryCreateStub = sinon.stub(OrderRepository,"createOrder").returnsArg(0)
        const savedOrder = await OrderService.createOrder(fakeOrder, fakeUser._id)  
        userRepositoryFindStub.calledOnce.should.be.true
        productRepositoryFindStub.calledOnce.should.be.true
        orderRepositoryCreateStub.calledOnce.should.be.true
        savedOrder.should.have.property("customer")
        savedOrder.customer.should.be.eql(fakeUser._id)
        savedOrder.should.have.property("shippingInfo")
        savedOrder.shippingInfo.should.have.property("address")
        savedOrder.shippingInfo.address.should.be.eql(fakeUser.info.address)
        savedOrder.products.should.have.lengthOf(1)
        savedOrder.products[0].should.have.property("productId")
        savedOrder.products[0].productId.should.eql(fakeProduct._id)
        savedOrder.products[0].should.have.property("serialNumber")
        should.not.exist(savedOrder.products[0].serialNumber)
        savedOrder.products[0].should.have.property("isFigure")
        savedOrder.products[0].isFigure.should.eql(fakeProduct.isFigure)
        savedOrder.products[0].should.have.property("originalUnitPrice")
        savedOrder.products[0].originalUnitPrice.should.eql(fakeProduct.unitPrice)
        savedOrder.products[0].should.have.property("finalUnitPrice")
        savedOrder.products[0].finalUnitPrice.should.eql(fakeProduct.unitPrice)
        savedOrder.orderDate.should.exist
        return true
    })
    it('it should update an order by id', async () => {
        const fakeUser = {
            username:faker.name.firstName(),
            salt:faker.internet.password(),
            passwordHash:faker.internet.password()
            
        }
        const fakeProduct = {
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }
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
        const orderFindStub = sinon.stub(OrderRepository, "getOrderById").returns(fakeOrder)
        const orderRepositoryUpdateStub = sinon.stub(OrderRepository, "updateOrderById").returns(updatedFakeOrder) 
        const order = await OrderService.updateOrder(String(fakeOrder._id), updatedFakeOrder)
        orderFindStub.calledOnce.should.be.true
        orderRepositoryUpdateStub.calledOnce.should.be.true
        order.should.exist
        order.should.eql(updatedFakeOrder)
        return true
    })
    it('it should update an order products serial numbers and status by id', async () => {
        const fakeUser = {
            username:faker.name.firstName(),
            salt:faker.internet.password(),
            passwordHash:faker.internet.password()
            
        }
        const fakeProduct = {
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            _id:"testorder",
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
            discount:0.1,
            shippingInfo:{
                address:"new york"
            },
            status:'QUEUED',
            orderDate: nowDate
        }
        const updateRequest = {
            _id:"testorder",
            status:'IN PROGRESS',
            products: [
                {
                    productId:String(fakeProduct._id),
                    serialNumber:"NEW SN",
                    isFigure:fakeProduct.isFigure,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
        } 
        const updatedFakeOrder = {
            _id:"testorder",
            customer: String(fakeUser._id),
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
        const orderFindStub = sinon.stub(OrderRepository, "getOrderById").returns(fakeOrder)
        const orderServiceUpdateByIdStub = sinon.stub(OrderService, "updateOrder").returns(updatedFakeOrder) 
        const order = await OrderService.updateSerialNumbersAndStatus(String(fakeOrder._id), updateRequest)
        orderFindStub.calledOnce.should.be.true
        orderServiceUpdateByIdStub.calledOnce.should.be.true
        orderServiceUpdateByIdStub.getCall(0).args[0].should.eql(String(fakeOrder._id))
        orderServiceUpdateByIdStub.getCall(0).args[1].should.eql(updatedFakeOrder)
        order.should.exist
        order.should.eql(updatedFakeOrder)
        return true
    })
    it('it should update an order status by id', async () => {
        const fakeUser = {
            username:faker.name.firstName(),
            salt:faker.internet.password(),
            passwordHash:faker.internet.password()
            
        }
        const fakeProduct = {
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true
        }
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            _id:"testorder",
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
            discount:0.1,
            shippingInfo:{
                address:"new york"
            },
            status:'QUEUED',
            orderDate: nowDate
        }
        const inProgressFakeOrder = {
            _id:"testorder",
            customer: String(fakeUser._id),
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
        const readyFakeOrder = {
            _id:"testorder",
            customer: String(fakeUser._id),
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
            status:'READY FOR DELIVERY',
            orderDate: nowDate
        }
        const orderRepositoryUpdateStatusByIdInProgressStub = sinon.stub(OrderRepository, "updateOrderStatusById").returns(inProgressFakeOrder) 
        const order = await OrderService.updateOrderStatusById(String(fakeOrder._id), "IN PROGRESS")
        orderRepositoryUpdateStatusByIdInProgressStub.calledOnce.should.be.true
        orderRepositoryUpdateStatusByIdInProgressStub.getCall(0).args[0].should.eql(String(fakeOrder._id))
        orderRepositoryUpdateStatusByIdInProgressStub.getCall(0).args[1].should.eql("IN PROGRESS")
        order.should.exist
        order.should.eql(inProgressFakeOrder)
        orderRepositoryUpdateStatusByIdInProgressStub.restore()
        const orderRepositoryUpdateStatusByIdReadyStub = sinon.stub(OrderRepository, "updateOrderStatusById").returns(readyFakeOrder) 
        const readyOrder = await OrderService.updateOrderStatusById(String(fakeOrder._id), "READY FOR DELIVERY")
        orderRepositoryUpdateStatusByIdReadyStub.calledOnce.should.be.true
        orderRepositoryUpdateStatusByIdReadyStub.getCall(0).args[0].should.eql(String(fakeOrder._id))
        orderRepositoryUpdateStatusByIdReadyStub.getCall(0).args[1].should.eql("READY FOR DELIVERY")
        readyOrder.should.exist
        readyOrder.should.eql(readyFakeOrder)
        orderRepositoryUpdateStatusByIdReadyStub.restore()
        return true
    })
})

afterEach(function () {
    sinon.restore();
});