const { Review } = require("../models/productAndReviewModel");
const catchAsyncError = require("../utils/catchAsyncError");
const { getAll, createOne, getOne, deleteOne, updateOne } = require("./handleFactory");
exports.setProductAndUserId = (req,res,next) => {
  if(!req.body.user) req.body.user = req.user.id;
  if(!req.body.product) req.body.product = req.params.productId;
  next()
}

exports.getAllReviews = catchAsyncError(async(req,res,next) => {
  const reviews = await Review.find({tour:req.params.productId}).populate({
    path:'user',
    select:'name'
  })
  res.status(200).json({
    status:'success',
    reviews
  })
})
exports.getReview = getOne(Review,{path:'user', select:'name'})
exports.updateReview = updateOne(Review)
exports.deleteReview = deleteOne(Review)
exports.getAllReviews = getAll(Review);
exports.createReview = createOne(Review, {path:'user', select:'name'})