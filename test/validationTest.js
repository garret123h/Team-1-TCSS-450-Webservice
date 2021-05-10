#!/usr/bin/env node

var assert = require('assert');

const app = require('../utilities/validationUtils.js') 

describe('Password test', function() {

    it('should be valid password', function () {
        assert.strictEqual(true, app.isValidPassword("Password1@"))
    })

    it('should be invalid password, does not have uppercase', function() {
        assert.strictEqual(false, app.isValidPassword("password1@"))
    })

    it('should be invalid password, does not have special character', function() {
        assert.strictEqual(false, app.isValidPassword("Password1"))
    })

    it('should be invalid password, does not have lowercase', function() {
        assert.strictEqual(false, app.isValidPassword("PASSWORD1@"))
    })

    it('should be invalid password, does not have digit', function() {
        assert.strictEqual(false, app.isValidPassword("Password@"))
    })

    it('should be invalid password, too small', function() {
        assert.strictEqual(false, app.isValidPassword("Pas@!"))
    })
})

describe('Email test', function() {
    after(function() {
        console.log("End Test");
        process.exit(0)
    });

    it ('should be valid email', function() {
        assert.strictEqual(true, app.isValidEmail("mike@yahoo.com"))
    })
    
    it ('should be invalid, no @', function() {
        assert.strictEqual(false, app.isValidEmail("mike!$yahoo.com"))
    })

    it ('should be invalid, no .com', function() {
        assert.strictEqual(false, app.isValidEmail('mike@yahoo'))
    })

    it ('should be invalid, empty email', function() {
        assert.strictEqual(false, app.isValidEmail(""))
    })
})
