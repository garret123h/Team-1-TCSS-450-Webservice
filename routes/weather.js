//express is the framework we're going to use to handle requests
const express = require('express')

// Used to send request to weather API
var weatherRequest = require('request');

const validation = require('../utilities').validation
let isValidZipcode = validation.isValidZipcode

// Get the Longitude and latitude utility
const location = require('../utilities').location
const LongLatFromZipcode = location.getLongLatFromZipcode

// Weather API key needed for HTTP request
const weatherAPIKey = process.env.WEATHER_API_KEY

// Weather API endpoint needed for HTTP request
const weatherApiEndpointCurrent = process.env.WEATHER_ENDPOINT_CURRENT
const weatherApiEndpointForecast = process.env.WEATHER_ENDPOINT_FORECAST
const weatherApiEndpointForecastHourly = process.env.WEATHER_ENDPOINT_HOURLY_FORECAST

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
        res.status(400).send({
            message: "Invalid zipcode"
        })
    }
})
/**
 *  @api {get} /current-weather/forecast/:zipcode Get 5 day weather forecast
 *  @apiName FiveDayForecast
 *  @apiGroup Weather
 * 
 *  @apiParam {String} zipcode location of weather to be retrieved
 *  @apiParamExample {String} https://group1-tcss450-project.herokuapp.com/weather/forecast/98030
 * 
 *  @apiSuccess {Success 200} {
 *      City name,
 *      list : [{
 *          Weather Description, 
 *          Temperature, 
 *          Min Temperature, 
 *          Max Temperature,
 *          Date
 *      }, ...
 *      ]
 *  }
 *  @apiError {400: Missing Parameters} {String} message "Missing required information"
 *  @apiError {400: Invalid zipcode} {String} message "Invalid zipcode"
 *  @apiError {400: other Error} {String} message "other error, see detail"
 *  @apiError (400: Other Error) {String} detail Information about th error
 */
 router.get('/forecast/:zipcode', (request, res) => {
    // First validate the zipcode first.
    if (isValidZipcode(request.params.zipcode)) {
        let endpoint = 'https://' + weatherApiEndpointForecast + 'zip=' + request.params.zipcode +
            ',us&appid=' + weatherAPIKey + '&units=imperial'

        // Send API request to weather API
        weatherRequest(endpoint, function (err, response, body) {
            if (err) {
                console.log(err)
            } else {
                // Extract the results
                let json = JSON.parse(body)

                // Since the API returns 3 hours interval forecasts. We want to iterate through 
                // the list by day. So group each forecast into a group of 8. Since 3*8=24
                let paritionForecastsByDay = partition(json.list, 8)

                let mapResults = paritionForecastsByDay.map(forecast => {
                    // From each list. Extract the weather description, Min and Max temperature
                    var minTempDay = 1000, maxTempDay = 0

                    forecast.forEach(interval => { // 3 hour interval forecast
                        if (interval.main.temp_min < minTempDay) 
                            minTempDay = interval.main.temp_min
                        if (interval.main.temp_max > maxTempDay)
                            maxTempDay = interval.main.temp_max
                    })
                    let weatherDescription = forecast[5].weather[0].description // Get the weather description for 12:00pm-3:00pm interval

                    return {
                        'Weather Description': weatherDescription,
                        'Min Temperature': minTempDay,
                        'Max Temperature': maxTempDay
                    }
                })

                res.send({
                    '5 day forecasts': mapResults,
                    'City': json.city.name
                })
            }
        })

    } else {
        res.status(400).send({
            message: "Invalid zipcode"
        })
    }

})

function partition(array, n) {
    return array.length ? [array.splice(0, n)].concat(partition(array, n)) : [];
}

/**
 *  @api {get} /24-forecast/:zipcode Get 24 hour weather forecast
 *  @apiName 24HourForecast
 *  @apiGroup Weather
 * 
 *  @apiParam {String} zipcode location of weather to be retrieved
 *  @apiParamExample {String} https://group1-tcss450-project.herokuapp.com/weather/24-forecast/98030
 * 
 *  @apiSuccess {Success 200} {
 *      City name,
 *      Min_temp,
 *      Max_temp,
 *      Weather_description
 *  }
 *  @apiError {400: Missing Parameters} {String} message "Missing required information"
 *  @apiError {400: Invalid zipcode} {String} message "Invalid zipcode"
 *  @apiError {400: other Error} {String} message "other error, see detail"
 *  @apiError (400: Other Error) {String} detail Information about th error
 */

router.get('/24-forecast/:zipcode', (request, result) => {
    // First validate the zipcode first.
    if (isValidZipcode(request.params.zipcode)) {

        let latLong = LongLatFromZipcode(request.params.zipcode)

        let endpoint = weatherApiEndpointForecastHourly + 'lat=' + latLong[0] + 
        '&lon=' + latLong[1] + '&exclude=current,minutely,daily,alerts' + '&appid=' + weatherAPIKey + '&units=imperial'

        // Send API request to weather API
        weatherRequest(endpoint, function (err, response, body) {
            if (err) {
                console.log(err)
            } else {
                // Extract the results
                let json = JSON.parse(body)
                let hourlyForecasts = json.hourly
                let currentTime = location.getTimeFromTimezone(json.timezone, json.timezone_offset)
                let results = {
                    "daily-forecasts": []
                }

                for (let i = 0; i < 24; i++) {
                    let hourlyForecast = hourlyForecasts[i]
                    let forecast = {
                        "Temperature": hourlyForecast.temp,
                        "Weather Description": hourlyForecast.weather[0].description,
                        "Time": location.incrementDateHour(currentTime, i)
                    }
                    results['daily-forecasts'].push(forecast)
                }
                result.send(results)
            }
        })
    } else {
        result.status(400).send({
            message: "Invalid zipcode"
        })
    }

})

module.exports = router;
