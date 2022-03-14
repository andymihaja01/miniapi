const ProductRepository = require("#repositories/productRepository.js")
exports.createProduct = async function(product){
    const savedProduct = await ProductRepository.createProduct(product) 
    return savedProduct
}

exports.getProductById = async function(productId){
    const product = await ProductRepository.getProductById(productId)
    return product
}