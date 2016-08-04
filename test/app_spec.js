var request = require('supertest');
var express = require('express');
var app = express();
require('../lib/index')(app);

describe('GET /', function() {

  it('should respond with 200', function(done) {
    request(app).get('/').expect(200, done);
  });

});

describe('GET /admin/users', function() {

  it('should respond with 200', function(done) {
    request(app).get('/admin/users').expect(200, done);
  });

});

describe('POST /admin/users', function() {

  it('should respond with 201 created status code', function(done) {
    request(app).post('/admin/users').expect(201, done);
  });

});
