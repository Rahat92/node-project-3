const { Product } = require("../models/productAndReviewModel");
const { createOne, getAll, getOne, updateOne, deleteOne } = require("./handleFactory");

exports.createProduct = createOne(Product)
exports.AllProduct = getAll(Product)
exports.getProduct = getOne(Product,{path:'review',select:'review rating user'})
exports.deleteProduct = deleteOne(Product)
exports.updateProduct = updateOne(Product)

