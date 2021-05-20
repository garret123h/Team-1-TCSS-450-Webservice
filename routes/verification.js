const express = require('express')
const router = express.Router()
const sendEmail = require('../utilities').sendEmail

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt

const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided
let isValidEmail = validation.isValidEmail
let isValidPassword = validation.isValidPassword

/**
 * @api {post} /send-verification Send verification email to user
 * @apiName SendVerification 
 * @apiGroup Verification
 * 
 * @apiParam {String} email The email to send the verification code to
 * 
 */
router.post('/send-verification/:email', (request, response) => {

    // Check if email is valid
    if (isValidEmail(request.params.email)) {
        sendEmail(
            process.env.EMAIL, request.params.email,
            'Email verification',
            '<h3>Email verification code: ' + process.env.EMAIL_VERIFICATION + '</h3>',
            process.env.EMAIL_PASSWORD
        )
        response.status(200).send()
    } else {
        response.status(400).send({
            message: "Invalid Email"
        })
    }
})

/**
 * @api {post} /change-password Change password of user
 * @apiName ChangePassword
 * @apiGroup Verification
 * 
 * @apiParam {String} email a users Email
 * @apiParam {String} newPassword Update password to this password
 *
 * 
 * @apiParamExample {json} Example:
 * {
 * "email": "mike@yahoo.com",
 * "newPassword": "testPassword"
 * }
 * 
 * @apiSuccess (Success 201) {String} success the password was changed
 * 
 */
router.put('/change-password', (request, response) => {

    // Retrieve data from body
    let newPassword = request.body.newPassword
    let email = request.body.email

    let salt = generateSalt(32)
    let salted_hash = generateHash(newPassword, salt)

    if (isStringProvided(newPassword) &&
        isStringProvided(email) &&
        isValidEmail(email) &&
        isValidPassword(newPassword)) {

        let query = "UPDATE MEMBERS SET Password=$1, Salt=$2 WHERE Email=$3"
        let values = [salted_hash, salt, email]
        pool.query(query, values)
            .then(result => {
                response.status(201).send({
                    success: "true"
                })
            })
            .catch((error) => {
                console.log(error)
                response.status(400).send()
            })

    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

module.exports = router;
