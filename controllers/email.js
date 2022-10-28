const nodemailer = require('nodemailer');
const sendEmaill = (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "fb63ff6c501187",
      pass: "a876046db90dff"
    },
  //   tls:{
  //     rejectUnauthorized:false
  // }
  })
  const mailOptions = {
    from:'Kamrul Hasan Rahat <khrahat150@gmail.com>',
    to:options.email,
    text:options.message
  }
  transporter.sendMail(mailOptions)
}

module.exports = sendEmaill;
