const sinon = require("sinon");
const mongoose = require("mongoose")
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
const server = require('#root/app.js');
const ProductRepository = require("#repositories/productRepository.js");
const ProductService = require("#services/product.js");
const Product = require("#models/product.js");
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.should()



describe('Product service test', () => {
    it('it should create a product', async () => {
        const fakeProduct = {
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true,
            isFamilyPack: false,
        }
        const productRepositoryCreateStub = sinon.stub(ProductRepository,"createProduct").returnsArg(0)
        const savedProduct = await ProductService.createProduct(fakeProduct)
        productRepositoryCreateStub.calledOnce.should.be.true
        savedProduct.should.have.property('name')
        savedProduct.name.should.eql(fakeProduct.name)
        savedProduct.should.have.property('unitPrice')
        savedProduct.unitPrice.should.eql(fakeProduct.unitPrice)
        savedProduct.should.have.property('isFigure')
        savedProduct.isFigure.should.eql(fakeProduct.isFigure)
        savedProduct.should.have.property('isFamilyPack')
        savedProduct.isFamilyPack.should.eql(fakeProduct.isFamilyPack)
        return true
    })
    it('it should get a product by id', async () => {
        const fakeProduct = {
            _id: "test",
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true,
            isFamilyPack: false,
        }
        const productRepositoryGetByIdStub = sinon.stub(ProductRepository, "getProductById").returns(fakeProduct)
        const product = await ProductService.getProductById("test")  
        productRepositoryGetByIdStub.calledOnce.should.be.true
        product.should.have.property('_id')
        product._id.should.eql(fakeProduct._id)
        product.should.have.property('name')
        product.name.should.eql(fakeProduct.name)
        product.should.have.property('unitPrice')
        product.unitPrice.should.eql(fakeProduct.unitPrice)
        product.should.have.property('isFigure')
        product.isFigure.should.eql(fakeProduct.isFigure)
        product.should.have.property('isFamilyPack')
        product.isFamilyPack.should.eql(fakeProduct.isFamilyPack)
        return true
    })
})

afterEach(function () {
    sinon.restore();
});