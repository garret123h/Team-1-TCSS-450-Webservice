const nodemailer = require('nodemailer')

let sendEmail = (sender, receiver, subject, message, password) => {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender,
            pass: password
        }
    });

    var mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        html: message
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendEmail
}