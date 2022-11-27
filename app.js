const express = require('express');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const bodyParser = require('body-parser');
const errorController = require('./controllers/errorController');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
var path = require('path');
const app = express();
app.use('/public',express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(express.json());
app.use(cookieParser())
// app.use((req,res,next) => {
//   console.log(req.cookies)
//   next()
// })
app.use('/api/v1/products',productRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)
app.all('*',(req,res,next) => {
  next(new AppError(`No route defined by this url`,400) )
})
app.use(errorController)

module.exports = app;