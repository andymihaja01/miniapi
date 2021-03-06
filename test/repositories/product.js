const sinon = require("sinon");
const mongoose = require("mongoose")
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http')
const { default: faker } = require("@faker-js/faker");
// Server is included so that it connects to the database
const server = require('#root/app.js');
const ProductRepository = require("#repositories/productRepository.js");
const Product = require("#models/product.js");
chai.use(chaiHttp)
chai.use(chaiAsPromised);
chai.should()



describe('Product repository test', () => {
    it('it should create a product', async () => {
        const fakeProduct = {
            name: "MiniFigure",
            unitPrice: 12.5,
            isFigure: true,
            isFamilyPack: false,
        }
        const product = await ProductRepository.createProduct(fakeProduct)  
        product.should.have.property("name")
        product.name.should.eql(fakeProduct.name)
        product.should.have.property("unitPrice")
        product.unitPrice.should.eql(fakeProduct.unitPrice)
        product.should.have.property("isFigure")
        product.isFigure.should.eql(fakeProduct.isFigure)
        product.should.have.property("isFamilyPack")
        product.isFamilyPack.should.eql(fakeProduct.isFamilyPack)
        return true
    })
    it('it should get a product by id', async () => {
        const fakeProduct = {
            name: "MiniFigure",
            unitPrice: 15,
            isFigure: true,
            isFamilyPack: false,
        }
        let newProduct = new Product(fakeProduct)
        newProduct = await newProduct.save()
        const product = await ProductRepository.getProductById(String(newProduct._id))  
        product.should.have.property("_id")
        product._id.should.eql(String(newProduct._id))
        return true
    })
    it('it should get products in a list of ids', async () => {
        const fakeProduct1 = {
            name: "MiniFigure",
            unitPrice: 15,
            isFigure: true,
            isFamilyPack: false,
        }
        const fakeProduct2 = {
            name: "MiniFigureVador",
            unitPrice: 15,
            isFigure: true,
            isFamilyPack: false,
        }
        let newProduct1 = new Product(fakeProduct1)
        let newProduct2 = new Product(fakeProduct2)
        newProduct1 = await newProduct1.save()
        newProduct2 = await newProduct2.save()
        const products = await ProductRepository.getProductsInList([String(newProduct1._id), String(newProduct2._id)])  
        products.should.all.have.property("_id")
        products.length.should.eql(2)
        products[0]._id.should.eql(String(newProduct1._id))
        products[1]._id.should.eql(String(newProduct2._id))
        return true
    })
})

afterEach(function () {
    sinon.restore();
});