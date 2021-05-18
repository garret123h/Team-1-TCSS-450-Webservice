//express is the framework we're going to use to handle requests
const express = require('express')
// //Access the connection to Heroku Database
const pool = require('../utilities').pool

var router = express.Router()

/**
 * @api {get} /contacts Request to get friends contact list 
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get friends contact list 
 * 
 * @apiSuccess {Object[]} friend contacts List of contacts
 * 
 * @apiError (404: memberId Not Found) {String} message "No friends contacts were found"
 * 
 * @apiError (400: SQL Error) {String} message "Missing required information"
 * @apiError (400: SQL Error) {String} message "Malformed parameter"
 * 
 * @apiUse JSONError
 */
router.get("/", (request, response, next) => {
    if (!request.decoded.memberid) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.decoded.memberid)) {
        response.status(400).send({
            message: "Malformed parameter"
        })
    } else {
        next()
    }
}, (request, response) => {
    let query = 'SELECT Verified, MemberID_B, Members.FirstName, Members.LastName, Members.email, Members.Username FROM Contacts INNER JOIN Members ON Contacts.MemberID_B = Members.MemberID where Contacts.MemberID_A = $1'
    let values = [request.decoded.memberid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "No friends contacts were found"
                })
            } else {
                let friendList = [];
                result.rows.forEach(entry =>
                    friendList.push(
                        {
                            "email": entry.email,
                            "firstName": entry.firstname,
                            "lastName": entry.lastname,
                            "userName": entry.username,
                            "memberId": entry.memberid_b,
                            "verified": entry.verified
                        }
                    )
                )
                response.send({
                    success: true,
                    contacts: friendList
                })
            }
        }).catch(error => {
            response.status(400).send({
                message: "Missing required information",
                error: error
            })
        })
});


/**
 * @api {get} /contacts/search To search the new contacts who doesn't in friend list 
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription search the new contacts who doesn't in friend list
 * 
 * @apiSuccess {Object[]} contacts List who is not friends
 * 
 * @apiError (404: Not Found) {String} message "No search contacts were found"
 * 
 * @apiError (400: SQL Error) {String} message "Missing required information"
 * @apiError (400: SQL Error) {String} message "Malformed parameter"
 * 
 * @apiUse JSONError
 */
 router.get("/search", (request, response, next) => {
    if (!request.decoded.memberid) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.decoded.memberid)) {
        response.status(400).send({
            message: "Malformed parameter"
        })
    } else {
        next()
    }
}, (request, response) => {
    let query = 'SELECT Members.MemberID, Members.FirstName, Members.LastName, Members.email, Members.Username FROM Members WHERE MemberID NOT IN (SELECT MemberID_B FROM Contacts WHERE MemberID_A = $1)'
    let values = [request.decoded.memberid]
    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "No search contacts were found"
                })
            } else {
                let listContacts = [];
                result.rows.forEach(entry =>
                    listContacts.push(
                        {
                            "email": entry.email,
                            "firstName": entry.firstname,
                            "lastName": entry.lastname,
                            "userName": entry.username,
                            "memberId": entry.memberid
                        }
                    )
                )
                response.send({
                    success: true,
                    contacts: listContacts
                })
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
});



module.exports = router