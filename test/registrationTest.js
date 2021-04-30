#!/usr/bin/env node

const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));

const app = require('../index.js'); // Our app

var registrationBody = {
    "first":"test",
    "last":"test",
    "email":"test@fake.email.com",
    "password":"test"
};

var signinBody = {
    "username":"test",
    "password":"password"
}

describe('Home page endpoint', function () {
    it('should load the home page', function() {
        return chai.request(app)
        .get('/')
        .then(function(res) {
            expect(res).to.have.status(200);
        })
    })
})

describe('Registration endpoint', function () {
    // POST register fake account.
    it('should try and register user', function() {
        return chai.request(app)
        .post('/auth')
        .send(registrationBody)
        .then(function(res) {
            expect(res).to.have.status(200)
          });
    });
}
)

/* Add test when sign in endpoint is created
describe('Signin page endpoint', function() {
    it('should try and sign in user', function() {
        return chai.request(app)
        .get('/auth')
        .send(signinBody)
        .then(function(res) {
            expect(res).to.have.status(200)
        })
    })
})
*/
