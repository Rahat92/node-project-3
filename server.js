const dotenv = require('dotenv');
const express = require('express')
const app = require('./app');
const mongoose = require('mongoose');
dotenv.config({
  path:`./config/config.env`
})
mongoose.connect('mongodb://localhost:27017/NodePro3',{
  useNewUrlParser:true
}).then(()=>console.log('database connect with server'))
const port = process.env.PORT || 3000;
app.listen(port,() => {
  console.log('Server is running on port ', port)
})