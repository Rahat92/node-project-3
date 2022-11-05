const AppError = require('../utils/appError')
const sendErrorProd = (error,res) => {
  if(error.isOperational){
    res.status(error.statusCode).json({
      status:error.status,
      message:error.message
    })
  }else{
    res.status(500).json({
      status:'error',
      message:'Something went very wrong'
    })
  }
}
const sendErrorDev = (err,res) => {
  res.status(err.statusCode).json({
    status:err.status,
    error:err,
    message:err.message,
    stack: err.stack
  })
}
const sendDuplicateFieldError = (error) => {
  return new AppError(`duplicate data ${Object.keys(error.keyValue)}`, 400)
}
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if(process.env.NODE_ENV === 'development'){
    sendErrorDev(err,res)
  }
  else if(process.env.NODE_ENV === 'PRODUCTION'){
    let error = { ...err }
    error.message = err.message
    if(error.code === 11000) error = sendDuplicateFieldError(error)
    sendErrorProd(error,res)
  }
}

