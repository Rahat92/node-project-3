const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name:String,
  role:String,
  email:{
    type:String,
    unique: true
  },
  photo: {
    type: String,
    contentType: String,
    default: 'Screenshot_1.png'
  },
  password:{
    type:String,
    select:false
  },
  passwordConfirm:{
    type:String,
    validate:{
      validator:function(el){
        return el === this.password
      },
      message:'Two Password not matched'
    },
  
  },
  passwordResetToken:String,
  passwordResetTokenExpires:Date,
  passwordChangeAt:Date
})

// userSchema.pre('save',async function(next){
//   if(!this.isModified('password')) return next()
//   this.password = await bcrypt.hash(this.password,10)
//   this.passwordConfirm = undefined;
//   next()
// })

userSchema.pre('save',function(next){
  if(!this.isModified('password') || this.isNew) return next()
  this.passwordChangeAt = Date.now()-1000;
  next()
})

userSchema.pre('save',async function(next){
  this.password = await bcrypt.hash(this.password,10);
  this.passwordConfirm = undefined;
  next()
})
userSchema.methods.isPasswordMatched = async function(providedPass){
  return await bcrypt.compare(providedPass, this.password)
}
userSchema.methods.isPasswordChanged = function(jwtTimeStamp){
  if(this.passwordChangeAt){
    const passwordChangeTime = parseInt(this.passwordChangeAt/1000,10)
    return passwordChangeTime > jwtTimeStamp
  }
  return false
}
userSchema.methods.createAndSendresetToken = function(){
  const resetToken =  crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto  
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetTokenExpires = Date.now() + 10*60*1000;
  return resetToken
}
const User = mongoose.model('User',userSchema);
module.exports = User;