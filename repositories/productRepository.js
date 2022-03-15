const Product = require("#models/product.js")
const { default: mongoose } = require("mongoose")
const {cleanModel} = require("#repositories/utils/modelCleaner.js")
/**
 * Creates and saves a product to database
 * @param {{name:String, unitPrice:Number, isFigure:Boolean, isFamilyPack:Boolean}} product 
 * @returns 
 */
async function createProduct(product){
    const productToSave = new Product({name:product.name, unitPrice:product.unitPrice, isFigure:product.isFigure, isFamilyPack:product.isFamilyPack})  
    await productToSave.save()
    const productObject =  cleanModel(productToSave)
    return productObject
}

/**
 * Finds a product by id
 * @param {String} productId 
 * @returns 
 */
async function getProductById(productId){
    const product = await Product.findOne({_id: mongoose.Types.ObjectId(productId)}).exec()
    const productObject = cleanModel(product)
    return productObject
}

/**
 * Finds all products with ids
 * @param {[String]} productIds 
 * @returns 
 */
 async function getProductsInList(productIds){
    const list = productIds.map((p) => mongoose.Types.ObjectId(p)) 
    const products = await Product.find({_id: { $in: list}}).exec()
    const productsObjects = products.map((p) => cleanModel(p))
    return productsObjects
}


module.exports = {
    createProduct,
    getProductById,
    getProductsInList
}