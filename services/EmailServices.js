const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const transport = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY
  })
);

function sendConfirmationEmail(user) {
  console.log(user)
  const url = 'http://www.nomorewaste.today'
  transport.sendMail({
    from: 'info@nitroclik.com',
    to: `${user} <${user}>`,
    bcc: 'info@nitroclik.com',
    subject: 'Conformation Email',
    html: `Confirmation Email <a href=${url}>${url}</a>`
  })
    .then(() => console.log("email was sent"))
    .catch((err) => console.log(err))
}

module.exports = { sendConfirmationEmail }