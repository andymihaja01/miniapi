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
const  NotificationService = require("#services/notification.js")
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
            isFigure: true,
            isFamilyPack: false,
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
            isFigure: true,
            isFamilyPack: false,
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
            isFigure: true,
            isFamilyPack:false,
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
            isFigure: true,
            isFamilyPack: false,
        }
        const fakeOrder = {
            products: [
                {
                    productId:String(fakeProduct._id),
                    quantity:1
                }
            ]
        }
        const userRepositoryFindStub = sinon.stub(UserRepository,"findById").returns(fakeUser)
        const productRepositoryFindStub = sinon.stub(ProductRepository,"getProductById").returns(fakeProduct)
        const orderRepositoryCreateStub = sinon.stub(OrderRepository,"createOrder").returnsArg(0)
        const applyDiscountsSpy = sinon.spy(OrderService, "applyDiscounts")
        const savedOrder = await OrderService.createOrder(fakeOrder, fakeUser._id)  
        userRepositoryFindStub.calledOnce.should.be.true
        productRepositoryFindStub.calledOnce.should.be.true
        applyDiscountsSpy.calledOnce.should.be.true
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
        savedOrder.products[0].should.have.property("isFamilyPack")
        savedOrder.products[0].isFamilyPack.should.eql(fakeProduct.isFamilyPack)
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
            isFigure: true,
            isFamilyPack: false,
        }
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            customer: String(fakeUser._id),
            products: [
                {
                    productId:String(fakeProduct._id),
                    serialNumber:null,
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                    quantity:1
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
                    quantity:1,
                    productId:String(fakeProduct._id),
                    serialNumber:"NEW SN",
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice + 20,
                }
            ],
            discount:0,
            shippingInfo:{
                address:"new york"
            },
            status:'IN PROGRESS',
            orderDate: nowDate
        }
        const orderFindStub = sinon.stub(OrderRepository, "getOrderById").returns(fakeOrder)
        const orderRepositoryUpdateStub = sinon.stub(OrderRepository, "updateOrderById").returns(updatedFakeOrder) 
        const applyDiscountSpy = sinon.spy(OrderService,"applyDiscounts")
        const order = await OrderService.updateOrder(String(fakeOrder._id), updatedFakeOrder)
        orderFindStub.calledOnce.should.be.true
        orderRepositoryUpdateStub.calledOnce.should.be.true
        applyDiscountSpy.calledOnce.should.be.true
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
            isFigure: true,
            isFamilyPack: false,
        }
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            _id:"testorder",
            customer: String(fakeUser._id),
            products: [
                {
                    quantity:1,
                    productId:String(fakeProduct._id),
                    serialNumber:null,
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
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
        const updateRequest = {
            _id:"testorder",
            status:'IN PROGRESS',
            products: [
                {
                    quantity:1,
                    productId:String(fakeProduct._id),
                    serialNumber:"NEW SN",
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
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
                    quantity:1,
                    productId:String(fakeProduct._id),
                    serialNumber:"NEW SN",
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
            discount:0,
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
            isFigure: true,
            isFamilyPack: false,
        }
        const nowDate = new Date(Date.now())
        const fakeOrder = {
            _id:"testorder",
            customer: String(fakeUser._id),
            products: [
                {
                    quantity:1,
                    productId:String(fakeProduct._id),
                    serialNumber:null,
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
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
        const inProgressFakeOrder = {
            _id:"testorder",
            customer: String(fakeUser._id),
            products: [
                {
                    quantity:1,
                    productId:String(fakeProduct._id),
                    serialNumber:"NEW SN",
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
            discount:0,
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
                    quantity:1,
                    productId:String(fakeProduct._id),
                    serialNumber:"NEW SN",
                    isFigure:fakeProduct.isFigure,
                    isFamilyPack:fakeProduct.isFamilyPack,
                    originalUnitPrice: fakeProduct.unitPrice,
                    finalUnitPrice: fakeProduct.unitPrice,
                }
            ],
            discount:0,
            shippingInfo:{
                address:"new york"
            },
            status:'READY FOR DELIVERY',
            orderDate: nowDate
        }
        const orderRepositoryUpdateStatusByIdInProgressStub = sinon.stub(OrderRepository, "updateOrderStatusById").returns(inProgressFakeOrder) 
        const notificationServiceNotifyStub = sinon.stub(NotificationService, "notifyOrderDoneWithInvoice").resolves(true)
        const order = await OrderService.updateOrderStatusById(String(fakeOrder._id), "IN PROGRESS")
        orderRepositoryUpdateStatusByIdInProgressStub.calledOnce.should.be.true
        orderRepositoryUpdateStatusByIdInProgressStub.getCall(0).args[0].should.eql(String(fakeOrder._id))
        orderRepositoryUpdateStatusByIdInProgressStub.getCall(0).args[1].should.eql("IN PROGRESS")
        notificationServiceNotifyStub.called.should.be.false
        order.should.exist
        order.should.eql(inProgressFakeOrder)
        orderRepositoryUpdateStatusByIdInProgressStub.restore()
        const orderRepositoryUpdateStatusByIdReadyStub = sinon.stub(OrderRepository, "updateOrderStatusById").returns(readyFakeOrder) 
        const readyOrder = await OrderService.updateOrderStatusById(String(fakeOrder._id), "READY FOR DELIVERY")
        orderRepositoryUpdateStatusByIdReadyStub.calledOnce.should.be.true
        orderRepositoryUpdateStatusByIdReadyStub.getCall(0).args[0].should.eql(String(fakeOrder._id))
        orderRepositoryUpdateStatusByIdReadyStub.getCall(0).args[1].should.eql("READY FOR DELIVERY")
        // wait for a bit for it to be called 
        await new Promise((resolve, _) => setTimeout(() => resolve(true), 10))
        notificationServiceNotifyStub.calledOnce.should.be.true
        readyOrder.should.exist
        readyOrder.should.eql(readyFakeOrder)
        orderRepositoryUpdateStatusByIdReadyStub.restore()
        return true
    })
    it("it should apply a 20% discount with a family pack", (done) => {
        const order = {
            discount : 0,
            products: [
                {
                    isFamilyPack:true    
                },
                {
                    isFigure:true
                }
            ]
        }
        const discountedOrder = OrderService.applyFamilyDiscount(order)
        discountedOrder.should.have.property("discount")
        discountedOrder.discount.should.eql(0.2)
        done()
    })
    it("it should not apply a 20% discount without a family pack", (done) => {
        const order = {
            discount : 0,
            products: [
                {
                    isFigure:true
                }
            ]
        }
        const discountedOrder = OrderService.applyFamilyDiscount(order)
        discountedOrder.should.have.property("discount")
        discountedOrder.discount.should.eql(0)
        done()
    })
    it("it should apply a price discount only on the MiNiFigures if there are 50 or more MiNiFigures in the order", (done) => {
        const order = {
            discount : 0,
            products: [
                {isFigure:false, quantity:1, originalUnitPrice:5, finalUnitPrice:5},
                {isFigure:true, quantity:30, originalUnitPrice:15, finalUnitPrice:15},
                {isFigure:true, quantity:20, originalUnitPrice:15, finalUnitPrice:15}
            ]
        }
        const discountedOrder = OrderService.applyMiniFigureDiscount(order)
        discountedOrder.should.have.property("miniFigureOverallDiscount")
        discountedOrder.miniFigureOverallDiscount.should.be.true
        discountedOrder.should.have.property("products")
        discountedOrder.products.filter((p) => p.isFigure).should.all.have.property("finalUnitPrice",9)
        discountedOrder.products.filter((p) => !p.isFigure).should.all.satisfy((p) => p.finalUnitPrice == p.originalUnitPrice)
        done()
    })
    it("it should not apply a price discount on the MiNiFigures if there are less than 50 MiNiFigures in the order", (done) => {
        const order = {
            discount : 0,
            products: [
                {isFigure:false, quantity:1, originalUnitPrice:5, finalUnitPrice:5},
                {isFigure:true, quantity:29, originalUnitPrice:15, finalUnitPrice:15},
                {isFigure:true, quantity:19, originalUnitPrice:15, finalUnitPrice:15}
            ]
        }


        const discountedOrder = OrderService.applyMiniFigureDiscount(order)
        discountedOrder.products.filter((p) => p.isFigure).should.all.have.property("finalUnitPrice",15)
        discountedOrder.products.filter((p) => !p.isFigure).should.all.satisfy((p) => p.finalUnitPrice == p.originalUnitPrice)
        done()
    })
    it("it should compute the correct price for an order", (done) => {
        const order = {
            discount:0.2,
            products:[
                {quantity:1, finalUnitPrice: 3},
                {quantity:2, isFigure:true, finalUnitPrice: 7},
                {quantity:3, isFamilyPack:true, finalUnitPrice: 11},
            ]
        }
        const total = OrderService.computeFinalPrice(order)
        total.should.eql(40)
        done()
    })
    it("it should apply discounts", async() => {
        const order = {
            discount:0.2,
            products:[
                {quantity:1, finalUnitPrice: 3},
                {quantity:2, isFigure:true, finalUnitPrice: 7},
                {quantity:3, isFamilyPack:true, finalUnitPrice: 11},
            ]
        }
        const applyFamilyDiscountStub = sinon.stub(OrderService,"applyFamilyDiscount").returnsArg(0)
        const applyMiniFigureDiscountStub = sinon.stub(OrderService,"applyMiniFigureDiscount").returnsArg(0)
        const computeFinalPriceStub = sinon.stub(OrderService, "computeFinalPrice").returns(40)
        const orderWithDiscounts = await OrderService.applyDiscounts(order)
        orderWithDiscounts.should.eql(order)
        applyFamilyDiscountStub.calledOnce.should.be.true
        applyMiniFigureDiscountStub.calledOnce.should.be.true
        computeFinalPriceStub.calledOnce.should.be.true
        return true
    })
})

afterEach(function () {
    sinon.restore();
});