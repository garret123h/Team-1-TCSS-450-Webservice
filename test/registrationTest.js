#!/usr/bin/env node

const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));

const app = require('../index.js'); // Our app

describe('Home page endpoint', function () {
    it('should load the home page', function () {
        return chai.request(app)
            .get('/')
            .then(function (res) {
                expect(res).to.have.status(200);
            })
    })
})

describe('Email verification endpoint', function () {
    // GET request for email verification
    it('should retrieve email verification code', function () {
        return chai.request(app)
            .get('/get-verification', function (err, response, body) {
                response.statusCode.should.equal(200)
                body.should.include(process.env.EMAIL_VERIFICATION)
                done()
            })
    })
})
