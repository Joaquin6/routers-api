var expect = require('chai').expect;
var express = require('express');
var loadRoutes = require('../lib/index')(express(), '../routes');
var pathToRoute = loadRoutes.pathToRoute;

describe('LoadRoutes.prototype.pathToRoute', function() {

  it('should return a string', function() {
    expect(pathToRoute('routes/index.js')).to.be.a('string');
  });

  it('should return a route relative to a base', function() {
    expect(pathToRoute('routes/admin/users.js', 'routes')).to.equal('/admin/users');
  });

  it('should convert index to slash', function() {
    expect(pathToRoute('routes/index.js'))
      .to.equal('/');

    expect(pathToRoute('routes/admin/index.js'))
      .to.equal('/');

    expect(pathToRoute('routes/admin/index.js', 'routes'))
      .to.equal('/admin');

    expect(pathToRoute('routes/index/admin.js', 'routes'))
      .to.equal('/index/admin');

    expect(pathToRoute('routes/admin/users/followers.js', 'routes'))
      .to.equal('/admin/users/followers');
  });

});
