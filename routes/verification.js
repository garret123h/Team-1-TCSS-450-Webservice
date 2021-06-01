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

/**
 * @api {get} /check-verify/:email Check if a user has been verified
 * @apiName CheckVerify 
 * @apiGroup Auth
 * 
 * @apiHeader {String} email "email" 
 * 
 * @apiSuccess {json} 
 * 
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "verify": true
 *     }
 * 
 * @apiError (400: Missing Authorization Header) {String} message "Missing user"
 * 
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header"
 * 
 * @apiError (404: User Not Found) {String} message "User not found"
 * 
 */
router.get('/check-verify/:email', (request, response, next) => {
    const email = request.params.email

    if (isValidEmail(email)) {
        let query = 'SELECT verification FROM MEMBERS WHERE email=$1'
        let values = [email]
        pool.query(query, values)
            .then(result => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found'
                    })
                } else {
                    let verifyResult = result.rows[0]
                    if (verifyResult.verification == 0) {
                        response.status(201).send({
                            verify: "false"
                        })
                    } else {
                        response.status(201).send({
                            verify: "true"
                        })
                    }
                }
            })
            .catch((error) => {
                console.log(error)
                response.status(400).send()
            })
    } else {
        response.status(400).send({
            message: "Invalid Email!"
        })
    }
})

/**
 * @api {get} /verify-user/:email Verify user
 * @apiName VerifyUser 
 * @apiGroup Auth
 * 
 * @apiHeader {String} email "email" 
 * 
 * @apiSuccess (200: Success)
 * 
 * @apiError (400: Missing Authorization Header) {String} message "Missing user"
 * 
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header"
 * 
 * @apiError (404: User Not Found) {String} message "User not found"
 * 
 */
router.post('/verify-user/:email', (request, response) => {
    const email = request.params.email
    if (isValidEmail(email)) {
        let query = 'UPDATE MEMBERS SET verification=1 WHERE email=$1'
        let values = [email]
        pool.query(query, values)
            .then(result => {
                response.status(200).send()
            })
            .catch((error) => {
                console.log(error)
                response.status(400).send()
            })
    } else {
        response.status(400).send({
            message: "Invalid Email!"
        })
    }
})

module.exports = router;
