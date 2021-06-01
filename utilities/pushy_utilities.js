const Pushy = require('pushy');

// Plug in your Secret API Key 
const pushyAPI = new Pushy(process.env.PUSHY_API_KEY);

//use to send message to a specific client by the token
function sendMessageToIndividual(token, message) {
    console.log(token)
    //build the message for Pushy to send
    var data = {
        "type": "msg",
        "message": message,
        "chatid": message.chatid
    }

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}


//use to send request to a specific client by the token
function sendRequestToIndividual(token, senderEmail, senderid, receiver) {
    //build the request data for Pushy to send
    var data = {
        "type": "request",
        "senderEmail":senderEmail,
        "senderid": senderid,
        "receiver": receiver
    }

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }
        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}

module.exports = {
    sendMessageToIndividual, sendRequestToIndividual
}