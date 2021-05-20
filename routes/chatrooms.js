//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @api {get} Request to get the chatrooms of a member
 * @apiName GetChatRooms
 * @apiGroup Chats
 * 
 * @apiDescription Retrieve the list of chat rooms the current user is associated with.
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess {boolean} true, and the list of chats
 * 
 * @apiError (400: Missing Params) {String} message "Missing required information"
 * @apiError (400: Invalid memberId) {String} message "Malformed parameter. memberId must be a number"
 * @apiError (404: query return no row) {String} message "No messages"
 * 
 * @apiError (400: SQL Error) {String} SQL error
 * 
 * @apiUse JSONError
 */
router.get("/", (request, response, next) => {
    // check if memberid is missing or not a number
    if (!request.decoded.memberid) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.decoded.memberid)) {
        response.status(400).send({
            message: "Malformed parameter. MemberId must be a number"
        })
    } else {
        next()
    }
}, (request, response) => {
    // Now we can get all the chat rooms
    let query = 'SELECT ChatID, Name FROM Chats where ChatID in (SELECT ChatID FROM ChatMembers where MemberID=$1)'
    let values = [request.decoded.memberid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "No messages found."
                })
            } else {
                let listChats = [];
                result.rows.forEach(entry =>
                    listChats.push(
                        {
                            "chat": entry.chatid,
                            "name": entry.name
                        }
                    )
                )
                response.send({
                    success: true,
                    chats: listChats
                })
            }
        }).catch(error => {
            console.log(error);
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
});

module.exports = router