const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name:{
    type:String
  },
  category:{
    type:String,
    default:'phone',
    required:[true, 'A product must have a category']

  },
  price:{
    type:Number,
    required: [ true, 'You must provide a price of the product']
  },
  ratingsAverage:{
    type:Number,
    default:4.5
  },
  numberOfRatings:{
    type: Number,
    default: 0
  }
},{
  toJSON:{ virtuals:true },
  toObject:{ virtuals:true },
})

productSchema.virtual('review',{
  ref:'Review',
  foreignField:'product',
  localField:'_id'
})

productSchema.pre(/^findOneAndDelete/,async function(next){
  // this middleware send current document to the post middleware
  this.doc = await this.clone().findOne().populate('review')
})
productSchema.post(/^findOneAndDelete/, async function(){
  if(this.doc){
    this.doc.review.map(async el=>{
      await Review.findByIdAndDelete(el._id)
    })
  }
})

const Product = mongoose.model('Product',productSchema);



//////review Model//////////

const reviewSchema = new mongoose.Schema({
  review: String,
  rating:Number,
  product:{
    type: mongoose.Schema.ObjectId,
    ref:'Product'
  },
  user:{
    type: mongoose.Schema.ObjectId,
    ref:'User'
  }
})

reviewSchema.index({product:1, user:1},{unique:true})
reviewSchema.pre(/^find/,function(next){
  this.populate({
    path:'user',
    select:'name'
  })
  next()
})
reviewSchema.statics.calcStat = async function(productId){
  const stat = await Review.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group:{
        _id:'$product',
        averageRating:{ $avg: '$rating' },
        nRating:{$sum: 1}
      }
    }
  ]);
    if(stat.length>0){
      await Product.findByIdAndUpdate(productId,{
        ratingsAverage: stat[0].averageRating,
        numberOfRatings:stat[0].nRating
      })
    }else{
      await Product.findByIdAndUpdate(productId,{
        ratingsAverage: 4.5,
        numberOfRatings:0
      })
    }
}
reviewSchema.post('save', function(){
  this.constructor.calcStat(this.product)
})
reviewSchema.pre(/^findOneAnd/, async function(next){
  this.r = await this.clone().findOne()
  next()
})
reviewSchema.post(/^findOneAnd/, async function(){
  if(this.r){
    await this.r.constructor.calcStat(this.r.product)
  }
})
const Review = mongoose.model('Review',reviewSchema);
module.exports = {Review, Product}

