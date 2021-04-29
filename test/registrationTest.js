#!/usr/bin/env node

const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));

const app = require('../index.js'); // Our app

var body = {
    first:"test",
    last:"test1",
    email:"test@fake.email.com",
    password:"test"
};

describe('Registration endpoint', function () {

    this.timeout(5000); // How long to wait for a response (ms)

    before(function () {

    }
    );

    after(function () {

    }
    );

    // POST register fake account.
    it('should register test user', function() {
        return chai.request(app)
        .post('/auth')
        .send(body)
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.results).to.be.an('array');
          });
    });
}
)
