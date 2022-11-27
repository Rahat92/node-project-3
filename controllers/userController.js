const User = require("../models/userModel");
const { promisify} = require('util')
const jwt = require('jsonwebtoken');
const multer = require('multer')
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const { getOne, getAll, deleteOne } = require("./handleFactory");
const sendMail = require('./email');

const tokenProducer = (id) => {
  return jwt.sign({id},'amarsonarbangla',{
    expiresIn:'10d',
  })
}

// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req,file,cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

// const multerFilter = (req,file,cb) => {
//   if(file.mimetype.startsWith('image')){
//     cb(null, true)
//   }else{
//     cb(new AppError('Only image you can upload', 400), false)
//   }
// }
// const upload = multer({
//   storage:multerStorage,
//   fileFilter: multerFilter,
// })

const multerStorage = multer.diskStorage({
  destination: (req,file, cb) => {
    cb(null, 'public/img/users')
  },
  filename: (req,file,cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  }
})
const multerFilter = (req,file, cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  }else{
    cb(new AppError('Only image you can upload', 400), false)
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

const createResponseAndSendToken = (user,res,statusCode) => {
  const token = tokenProducer(user._id);
  const cookieOptions = {
    expires:new Date(Date.now()+10*24*60*60*1000),
    httpOnly:true,
  }
  if(process.env.NODE_ENV === 'PRODUCTION') cookieOptions.secure = true;
  res.cookie('token',token,cookieOptions)
  res.status(statusCode).json({
    status:'success',
    token,
    user
  })
}
exports.uploadUserPhoto = upload.single('photo')
exports.signUp = catchAsyncError(async(req,res,next) => {
  const { name, role, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,role,email,password,passwordConfirm
  })

  createResponseAndSendToken(newUser,res,200)
})

// exports.logIn = catchAsyncError(async(req,res,next) => {
//   const { email, password } = req.body;
//   if(!email || !password) return next(new AppError(`Please provide email and password`,400))
//   const user = await User.findOne({email}).select('+password');
//   if(!user || !(await user.isPasswordMatched(password))) return next(new AppError(`Invalid email or password`,400));
//   createResponseAndSendToken(user,res,200)
// })

exports.logIn = catchAsyncError(async(req,res,next) => {
  const { email, password } = req.body;
  if(!email || !password) return next(new AppError('Please Provide Email And Password', 400));
  const user = await User.findOne({email}).select('+password');
  if(!user || !await(user.isPasswordMatched(password))) return next(new AppError('Invalid email or password', 400));
  createResponseAndSendToken(user, res, 200)
})

exports.protect = catchAsyncError(async(req,res,next) => {
  // let token;
  // if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
  //   token = req.headers.authorization.split(' ')[1]
  // }
  const { token } = req.cookies;
  if(!token) return next(new AppError(`You are now not logged in, Please log in first`,400))
  const decoded = await promisify(jwt.verify)(token,'amarsonarbangla')
  const currentUser = await User.findById(decoded.id);
  if(!currentUser) return next(new AppError(`The user belonging this token is no longer exist`,400))
  if(currentUser.isPasswordChanged(decoded.iat)) return next(new AppError(`The user changed password after issuing this  token, Please log in again`,400))
  req.user = currentUser;
  next()
})

exports.restrictTo = (...roles) => {
  return (req,res,next) => {
    if(!roles.includes(req.user.role)) return next(new AppError(`You are not allowed to perform this action`,400))
    next()
  }
}

const filtered = (obj,...allowedField) => {
  let newObj = {}
  Object.keys(obj).forEach(el=>{
    if(allowedField.includes(el)){
      newObj[el] = obj[el]
    }
  })
  return newObj
}
exports.getMe = (req,res,next) => {
  req.params.id = req.user.id;
  next()
}
exports.getAllUser = getAll(User)
exports.getUser = getOne(User)
exports.updateMe = catchAsyncError(async(req,res,next) => {
  console.log(req.file)
  console.log(req.body)
  if(req.body.password || req.body.passwordConfirm) return next(new AppError(`This route not for password update`,400))
  const allowedField = filtered(req.body, "name","email")
  if(req.file) allowedField.photo = req.file.filename
  const user = await User.findByIdAndUpdate(req.user._id,allowedField,{
    new:true,
    runValidators:true
  });
  res.status(200).json({
    status:'success',
    user
  })
})
exports.updateUserRole = catchAsyncError(async(req,res,next) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id,{role}, {
    new: true,
    runValidators: true
  })
  if(!user) return next(new AppError('no user found by this id', 400))
  res.status(200).json({
    status:'success',
    user
  })
})
exports.updatePassword = catchAsyncError(async(req,res,next) => {
  const { currentPassword, password, passwordConfirm } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if(!currentPassword) return next(new AppError(`You must have to provide your current pssword`,400))
  const isRightPerson = await user.isPasswordMatched(req.body.currentPassword);
  if(!isRightPerson) return next(new AppError(`Your current password is not correct!`,401));
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save()
  createResponseAndSendToken(user,res,200)
})


exports.logOut = catchAsyncError(async(req,res,next) => {
  res.cookie('token',null,{
    expires:new Date(Date.now()),
    httpOnly:true
  })
  res.status(200).json({
    status:'success',
    message:'Logged Out'
  })
})

exports.forgotPassword = catchAsyncError(async(req,res,next) => {

  const { email } = req.body;
  const user = await User.findOne({email}).select('+password')
  if(!user) return next(new AppError(`No user found by this email`,400))
  const resetToken = user.createAndSendresetToken();
  await user.save({validateBeforeSave:false});
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/passwordreset/${resetToken}`;
  const message = `Forgot your password? submit your patch request with your new password and passwordConfirm to ${resetUrl}.\nIf you didn't forget your password.Please ignore this email`;
  try{
    sendMail({
      email:user.email,
      subject:`password reset token valid for 10 minutes`,
      message
    })
    res.status(200).json({
      status:'success',
      message:`token send to your email`
    })
  }catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({validateBeforeSave:false});
    return next(new AppError(`there was an error sending the email, Please try again`,500))
  }
})
exports.deleteUser = deleteOne(User)