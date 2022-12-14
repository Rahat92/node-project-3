const express = require('express');
const { AllProduct, createProduct, getProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, restrictTo } = require('../controllers/userController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
router.use('/:productId/reviews',reviewRouter)
router
  .route('/')
  .get(AllProduct)
  .post(protect, restrictTo('admin'),createProduct)

router
  .route('/:id')
  .get(getProduct)
  .delete(protect,restrictTo('admin'),deleteProduct)
  .patch(protect,restrictTo('admin'),updateProduct)
const productRouter = router;
module.exports = productRouter;