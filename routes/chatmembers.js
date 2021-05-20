//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @api {put} /:chatId/:memberId Request to add a member to a chat room
 * @apiName AddChatMember
 * @apiGroup Chats
 * 
 * @apiDescription Add a user with memberId into a chat room with chatId.
 *
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiParam {number} chatId the chatId of the chat room
 * @apiParam {number} memberId the memberId of the user
 * 
 * @apiSuccess (Success 201) {boolean} success true when the member is added
 * @apiSuccess (Success 201) {String} message "Added member to chat!" when the member is added
 * 
 * @apiError (400: Missing Params) {String} message "Missing required information"
 * @apiError (400: Invalid ChatId) {String} message "Malformed parameter. chatId must be a number"
 * @apiError (404: query returns no row) {String} message "Chat ID not found!"
 * @apiError (404: query returns no row) {String} message "Invalid e-mail!"
 * 
 * @apiError (400: SQL Error) {String} SQL error
 * 
 * @apiUse JSONError
 */
router.put("/:chatId/:memberId", (request, response, next) => {
    // check for missing chatId or memberId
    if (!request.params.chatId || !request.body.memberid) {
        response.status(400).send({
            message: "Missing required information"
        })
    }  else if (isNaN(request.params.chatId)) {
        response.status(400).send({
            message: "Malformed parameter. ChatId must be a number"
        })
    } else {
        next()
    }
}, (request, response, next) => {
    // check for missing chats
    let query = 'SELECT * FROM CHATS WHERE ChatId=$1'
    let values = [request.params.chatId]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "Chat ID not found!"
                })
            } else {
                next()
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })

}, (request, response, next) => {
    // check the member exists
    let query = 'SELECT * FROM Members WHERE MemberId=$1'
    let values = [request.body.memberid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "Invalid e-mail!"
                })
            } else {
                //user found
                next()
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
}, (request, response, next) => {
    // check if member is already in chat
    let query = 'SELECT * FROM ChatMembers WHERE ChatId=$1 AND MemberId=$2'
    let values = [request.params.chatId, request.body.memberid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount > 0) {
                response.json({
                    success: false,
                    message: "Member already in chat!"
                })
            } else {
                next()
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })

}, (request, response) => {
    // Now we can add the chat member
    let insert = `INSERT INTO ChatMembers(ChatId, MemberId)
                VALUES ($1, $2)
                RETURNING *`
    let values = [request.params.chatId, request.body.memberid]
    pool.query(insert, values)
        .then(result => {
            response.json({
                success: true,
                message: "Added member to chat!"
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
    }
)

module.exports = router