const express = require('express');
const { createReview, setProductAndUserId, getAllReviews, getReview, deleteReview, updateReview } = require('../controllers/reviewController');
const { protect } = require('../controllers/userController');
const router = express.Router({mergeParams:true});

router
  .route('/')
  .get(getAllReviews)
  .post(protect,setProductAndUserId,createReview)
router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview)
const reviewRouter = router;
module.exports = reviewRouter;