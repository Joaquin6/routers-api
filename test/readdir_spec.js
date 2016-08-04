var path = require('path');
var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var express = require('express');
var loadRoutes = require('../lib/index')(express());
chai.use(require('chai-fs'));

describe('LoadRoutes.prototype.readdir', function() {

  it('should return an array', function() {
    expect(loadRoutes.readdir('../routes')).to.be.an('array');
  });

  it('should contain a list of files and folders', function() {
    var files = loadRoutes.readdir('../routes');

    files.forEach(function(file) {
      expect(file).to.be.a('string');
      expect(file).to.be.a.path();
    });
  });

});
