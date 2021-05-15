//express is the framework we're going to use to handle requests
const express = require('express')

// Used to send request to weather API
var weatherRequest = require('request');

const validation = require('../utilities').validation
let isValidZipcode = validation.isValidZipcode

// Weather API key needed for HTTP request
const weatherAPIKey = process.env.WEATHER_API_KEY

// Weather API endpoint needed for HTTP request
const weatherApiEndpointCurrent = process.env.WEATHER_ENDPOINT_CURRENT
const weatherApiEndpointForecast = process.env.WEATHER_ENDPOINT_FORECAST

const router = express.Router()

/**
 * @api {get} /current-weather/:zipcode Get current weather based off of zipcode
 * @apiName CurrentWeather
 * @apiGroup Weather 
 * 
 * @apiParam {String} zipcode location of weather to be retrieved
 * 
 * @apiParamExample {String} https://group1-tcss450-project.herokuapp.com/weather/current-weather/98030
 * 
 * @apiSuccess {Success 200} {json} {
 *  Weather Description, 
 *  Temperature, 
 *  City name
 * }
 * 
 * @apiError {400: Missing Parameters} {String} message "Missing required information"
 * @apiError {400: Invalid zipcode} {String} message "Invalid zipcode"
 * @apiError {400: other Error} {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about th error
 * 
 */
router.get('/current-weather/:zipcode', (request, res) => {
    // First validate the zipcode first.
    if (isValidZipcode(request.params.zipcode)) {

        let endpoint = 'https://' + weatherApiEndpointCurrent + 'zip='
            + request.params.zipcode + ',us&appid=' + weatherAPIKey + '&units=imperial'

        // Send API request to weather API
        weatherRequest(endpoint, function (err, response, body) {
            if (err) {
                console.log(err)
            } else {
                // Extract the results
                let json = JSON.parse(body)
                let result = {
                    'Weather Description': json.weather[0].description,
                    'Temperature': json.main.temp,
                    'City name': json.name
                }
                res.send(result)
            }
        })

    } else {
        response.status(400).send({
            message: "Invalid zipcode"
        })
    }
})

module.exports = router;
