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
                isFigure: true
            }
            const product = await ProductRepository.createProduct(fakeProduct)  
            product.should.have.property("name")
            product.name.should.eql(fakeProduct.name)
            product.should.have.property("unitPrice")
            product.unitPrice.should.eql(fakeProduct.unitPrice)
            product.should.have.property("isFigure")
            product.isFigure.should.eql(fakeProduct.isFigure)
            return true
        })
    })

afterEach(function () {
    sinon.restore();
});