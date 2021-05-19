// Used to handle requests
const express = require('express')

// Heroku database
let pool = require('../utilities/utils').pool

let getHash = require('../utilities/utils').getHash

let sendEmail = require('../utilities/utils').sendEmail

var router = express.Router()

//We use this create the SHA256 hash
const crypto = require("crypto")
const { debug } = require('console')

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())


// Checks if the given user needs to set a new password

/**
 * @api {get} /resetpassword Request to get whether a user needs to set a new password
 * @apiName GetResetpassword
 * @apiGroup Resetpassword
 * 
 * @apiBody {String} email the email of the user to check
 * 
 * @apiSuccess {boolean} success true when the user was found
 * 
 * @apiSuccess {boolean} passwordneeded true when the user requires setting a new password
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 */ 
router.get('/', (req, res) => {
    var email = req.body.email
    if(email) {

        let theQuery = "SELECT * FROM members WHERE email = $1;"
        let values = [email]
        pool.query(theQuery, values)
            .then(result => {
                res.status(201).send({
                    success: true,
                    passwordneeded: result.rows[0].newpassword
                })
            }).catch((err) => {
                //log the error
                console.log(err)
                //console.log(err)
                res.status(400).send({
                    message: err.detail
                })
            })
    } else {
        res.status(400).send({
            message: "Missing required information"
        })
    }
})

// Resets the given user's password and sends an email
/**
 * @api {post} /resetpassword Request to get whether a user needs to set a new password
 * @apiName PostResetpassword
 * @apiGroup Resetpassword
 * 
 * @apiBody {String} email the email of the user's password is to be reset
 * 
 * @apiSuccess {boolean} success true when the user was found and their password reset. an email will be sent to the given address with a new temporary password
 * 
 * @apiSuccess {String} message the confirmation message returned when sending the email 
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 */ 
router.post('/', (req, res) => {    
    // // validate on empty parameters
    res.type("application/json")

    var email = req.body.email
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(email) {
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let theQuery = "SELECT * FROM members WHERE email = $1;"
        let values = [email]
        pool.query(theQuery, values)
            .then(result => {
                if (result.rows.length > 0) {
                    // The username does exist in our database.
                    var newPassword = makeid(12);  // Number inside is the length of the new password.

                    let salt = crypto.randomBytes(32).toString("hex")
                    let salted_hash = getHash(newPassword, salt)

                    let theQuery = "UPDATE members SET password = $1, salt = $2, newpassword = $3  WHERE email = $4;"
                    let values = [salted_hash, salt, true, email]
                    pool.query(theQuery, values)
                    .then(result => {
                        var emailResponse = sendEmail("uwnetid@uw.edu", email, "New temporary password", "Your new temporary password is: \n" + newPassword);

                        //We successfully edited the user's password, let the user know
                        res.status(201).send({
                            success: true,
                            message: emailResponse
                        })
                    })
                    .catch((err) => {
                        //log the error
                        console.log(err)
                        //console.log(err)
                        res.status(400).send({
                            message: err.detail
                        })
                    })
                } else {
                    res.status(400).send({
                        message: "Username does not exist"
                    })
                }
            })
            .catch((err) => {
                //log the error
                console.log(err)
                res.status(400).send({
                    message: err.detail
                })
            })
    } else {
        res.status(400).send({
            message: "Missing required information"
        })
    }
});


// Sets the password to the given one if the temp password was used and is correct
// Resets the given user's password and sends an email
/**
 * @api {put} /resetpassword Request to get whether a user needs to set a new password
 * @apiName PutResetpassword
 * @apiGroup Resetpassword
 * 
 * @apiHeader {String} authorization Valid basic auth formatted email:password combination using the temporary password
 * 
 * @apiBody {String} newpassword the new password to set the user's password to
 * 
 * @apiSuccess {boolean} success true when the user was found
 * 
 * @apiSuccess {String} message New password set when succesful
 * 
 * @apiError (404: Unknown User) {String} message User not found
 * 
 * @apiError (404: No Reset Needed) {String} message A new password has not been requested
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiError (400: Bad Credentials) {String} message Credentials did not match
 */ 
router.put('/', (request, response) => {
    if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
        return response.status(401).json({ message: 'Missing Authorization Header' })
    }
    // obtain auth credentials from HTTP Header
    const base64Credentials =  request.headers.authorization.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [email, theirPw] = credentials.split(':')

    var newPassword = request.body.newpassword

    if(email && theirPw && newPassword) {
        let theQuery = "SELECT Password, Salt, MemberId, newpassword FROM Members WHERE Email=$1"
        let values = [email]
        pool.query(theQuery, values)
            .then(result => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found' 
                    })
                    return
                }
                let salt = result.rows[0].salt
                //Retrieve our copy of the password
                let ourSaltedHash = result.rows[0].password 

                //Combined their password with our salt, then hash
                let theirSaltedHash = getHash(theirPw, salt)

                //Did our salted hash match their salted hash?
                if (ourSaltedHash === theirSaltedHash ){
                    // Check if a new password has been requested to be made
                    if (!result.rows[0].newpassword) {
                        response.status(404).send({
                            message: 'A new password has not been requested' 
                        })
                        return
                    }

                    let salt = crypto.randomBytes(32).toString("hex")
                    let salted_hash = getHash(newPassword, salt)

                    let theQuery = "UPDATE members SET password = $1, salt = $2, newpassword = $3  WHERE email = $4;"
                    let values = [salted_hash, salt, false, email]
                    pool.query(theQuery, values)
                    .then(result => {
                        //We successfully edited the user's password, let the user know
                        response.status(201).send({
                            success: true,
                            message: 'New password set'
                        })
                    })
                    .catch((err) => {
                        //log the error
                        console.log(err)
                        //console.log(err)
                        response.status(400).send({
                            message: err.detail
                        })
                    })
                } else {
                    //credentials dod not match
                    response.status(400).send({
                        message: 'Credentials did not match' 
                    })
                }
            }).catch((err) => {
                //log the error
                console.log(err.stack)
                response.status(400).send({
                    message: err.detail
                })
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

// Helper function to make random strings
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

module.exports = router  