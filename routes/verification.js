const express = require('express')
const router = express.Router()
const sendEmail = require('../utilities').sendEmail

const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isValidEmail = validation.isValidEmail

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

router.get('/check-verification/:email', (request, response) => {

    // Check if email is valid
    if (isValidEmail(request.params.email)) {
        let theQuery = 'SELECT Verification FROM MEMBERS WHERE Email=$1'
        let values = [request.params.email]
        pool.query(theQuery, values)
            .then(result => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found'
                    })
                    return
                }

                if (result.rows[0].verification === 1) {
                    response.json({
                        verified: "true"
                    })
                } else {
                    response.json({
                        verified: "false"
                    })
                }
            })

    } else {
        response.status(400).send({
            message: "Invalid Email"
        })
    }
})

module.exports = router;
