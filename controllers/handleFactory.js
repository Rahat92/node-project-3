const ApiFeatures = require("../utils/apiFeatures")
const AppError = require("../utils/appError")
const catchAsyncError = require("../utils/catchAsyncError")

exports.createOne = (Model, popOptions) => {
  return catchAsyncError(async(req,res,next) => {
    let doc = await Model.create(req.body)
    if(popOptions){
      doc = await Model.findById(doc._id)
    }
    res.status(200).json({
      status:'success', 
      doc
    })
  })
}
exports.getAll = Model => {
  return catchAsyncError(async(req,res,next) => {
    let filter = {};
    if(req.params.productId) filter.product = req.params.productId
    const resPerPage = 3
    const currentPage = req.query.page*1 || 1
    const skip = (currentPage-1)*resPerPage;
    let docs = new ApiFeatures(Model.find(filter),req.query).filter().sort().pagination(resPerPage, skip).search()
    docs = await docs.query
    const docNum = await Model.countDocuments()
    res.status(200).json({
      status:'success',
      docNum,
      currentPage,
      result:docs.length,
      currentNum: skip+docs.length,
      docs
    })
  })
}
exports.getOne = ( Model, popOptions ) => {
  return catchAsyncError(async(req,res,next) => {
    let query = Model.findById(req.params.id);
    if(popOptions){
      query = query.populate(popOptions)
    }
    const doc = await query;
    if(!doc){
      return next(new AppError(`No document found by this id:${req.params.id} `, 400))
    }
    res.status(200).json({
      status:'success',
      doc
    })
  })
}
exports.updateOne = Model => {
  return catchAsyncError(async(req,res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true
    })
    res.status(200).json({
      status:'success',
      doc
    })
  })
}
exports.deleteOne = Model => {
  return catchAsyncError(async(req,res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    res.status(200).json({
      status:'success',
      doc:null
    })
  })
}