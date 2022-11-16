const express = require('express');
const { createReview, setProductAndUserId, getAllReviews, getReview, deleteReview, updateReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/userController');
const router = express.Router({mergeParams:true});

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'),setProductAndUserId,createReview)
router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(protect, restrictTo('admin','user'),deleteReview)
const reviewRouter = router;
module.exports = reviewRouter;