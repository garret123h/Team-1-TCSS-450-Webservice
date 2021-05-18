// Used for local time conversion
const moment = require('moment-timezone');

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: fs.createReadStream('utilities/lookup_LatLong.txt')
});

// Create Map object for quick lookup
const map = new Map()

rl.on('line', (line) => {
    let zipFromFile = line.split(',');
    map[zipFromFile[0]] = [zipFromFile[1], zipFromFile[2]]
});

/**
 * Converts a zipcode into the longitude and latitude
 * @param {String} zipcode The zipcode to convert to longitude and latitude
 */
let getLongLatFromZipcode = (zipcode) => {
    return map[zipcode]
}

/** 
 * function to calculate local time
 */
function getTimeFromTimezone(zone, offset) {
    let date = new Date(new Date().toLocaleString("en-US", { timeZone: zone }))
    var utc = date.getTime();
    var nd = new Date(utc + (3600000 * offset));
    return nd
}

/**
 * Increment Date by n hours
 */
function incrementDateHour(date, nHour) {
    let d = new Date(moment(date).add(nHour, 'hours').format())
    var ampm = (d.getHours() >= 12) ? "PM" : "AM";
    var hours = d.getHours();
    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }
    return hours + ":" + d.getMinutes() + ' ' + ampm
}

module.exports = {
    getLongLatFromZipcode, getTimeFromTimezone, incrementDateHour
}
