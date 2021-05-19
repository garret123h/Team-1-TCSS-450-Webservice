//Get the connection to Heroku Database
let pool = require('./sql_conn.js')

//We use this create the SHA256 hash
const crypto = require("crypto");

// Used to send emails
var nodemailer = require('nodemailer');

// Also used to send emails
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'TCSS450Fall2020Group2@gmail.com',
    pass: process.env.GMAIL_PASS
    //   pass: process.env.GMAIL_PASS
    }
});

/**
 * Method to send an email.
 * We put this in its own method to keep consistency
 * @param {string} from the address of the party sending the email
 * @param {string} receiver the address of the party receiving the email
 * @param {string} subj the subject of the email
 * @param {string} message the message of the email
 * @returns {string} the result of email attempt
 * @throws {console.error()} when an error occurs. See error for more details in such a case
 */
function sendEmail(from, receiver, subj, message) {
 // using nodemailer for sending email from node.
    var mailOptions = {
        from: 'TCSS450Fall2020Group2@gmail.com',
        to: receiver,
        subject: subj,
        text: message
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            throw error;
        } else {
            return info.response;
        }
    });
}

/**
 * Method to get a salted hash.
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
 return crypto.createHash("sha256").update(pw + salt).digest("hex");
}

let messaging = require('./pushy_utilities.js')

module.exports = {
 pool, getHash , sendEmail, messaging
}

