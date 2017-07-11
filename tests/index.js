'use strict';

var path = require('path');
var assert = require('assert');
var mockery = require('mockery');

describe('The path resolution method', function() {
  var resolve = require('../lib/resolve').default;
  var originalReqMainFilename = require.main.filename;

  // Make sure env variable isn't set for tests
  if (process.env.APP_ROOT_PATH) {
    delete process.env.APP_ROOT_PATH;
  }

  beforeEach(function() {
    require.main.filename = '/var/www/app.js';
  });

  afterEach(function() {
    require.main.filename = originalReqMainFilename;
  });

  // Check global paths
  it('should use require.main.filename if the path is in the globalPaths array', function() {
    var expected = path.dirname(require.main.filename);
    require('module').globalPaths.forEach(function(globalPath) {
      var testPath = globalPath + path.sep + 'routers-api';
      if (testPath.includes('/lib/node/routers-api'))
        testPath = testPath.replace('/lib/node/routers-api', '/lib/node_modules/routers-api');
      console.log(testPath);
      assert.equal(resolve(testPath), expected);
    });
  });

  // Check bin/ dir in global path
  it('should correctly handle the global bin/ edge case', function() {
    var prefix = path.resolve(path.dirname(path.dirname(process.execPath)), 'lib', 'node_modules');
    var testPath = prefix + '/routers-api/bin/cli.js';
    var expected = prefix + '/routers-api';
    require.main.filename = testPath;
    assert.equal(resolve(testPath), expected);
  });

  // Check some standard path layouts
  it('should use String.split() in common cases', function() {
    var cases = [
      '/var/www/node_modules/routers-api',
      '/var/www/node_modules/somemodule/node_modules/routers-api',
      '/var/www/node_modules/somemodule/node_modules/someothermodules/node_modules/routers-api',
      '/var/www/node_modules/.bin',
      '/var/www/node_modules/bin'
    ];
    var expected = '/var/www';
    cases.forEach(function(testPath) {
      assert.equal(resolve(testPath), expected);
    });
  });

  // Check root path
  it('should still use String.split() in the root directory', function() {
    assert.equal(resolve('/node_modules'), '');
  });

  // Check unexpected path
  it('should use require.main.filename on unexpected input', function() {
    var cases = [
      'just-some-jibberish',
      '/var/www/libs/routers-api',
      'path/from/electron'
    ];
    var expected = path.dirname(require.main.filename);
    cases.forEach(function(testPath) {
      assert.equal(resolve(testPath), expected);
    });
  });

  // Check when setting via environmental variable
  it('should respect the APP_ROOT_PATH environmental variable', function() {
    var expected = '/some/arbirary/path';
    process.env.APP_ROOT_PATH = expected;
    assert.equal(resolve('/somewhere/else'), expected);
    delete process.env.APP_ROOT_PATH;
  });

  it('should defer to the main process inside an electron renderer process', function() {
    var fauxElectronPath = 'path/from/electron';
    var lastRemoteModule = null;

    // Set up mock
    mockery.registerAllowable('path');
    mockery.registerMock('electron', {
      remote: {
        require: function(moduleName) {
          lastRemoteModule = moduleName;
          return {
            path: fauxElectronPath
          };
        }
      }
    });
    global.window = {
      process: {
        type: 'renderer'
      }
    };
    mockery.enable();

    // Run test
    assert.equal(resolve('funky'), fauxElectronPath);
    assert.equal(lastRemoteModule, 'routers-api');

    // Tear down mock
    mockery.deregisterMock('electron');
    delete global.window;
    mockery.disable();
  });
});

describe('The public interface', function() {
  var lib = require('../lib/index.js').default;
  var root = path.resolve(__dirname);
  var pub = lib(root + '/node_modules/routers-api');

  it('should expose a resolve() method that resolves a relative path to the root path', function() {
    assert(pub.resolve);
    assert.equal(pub.resolve('subdir/filename.js'), root + '/subdir/filename.js');
  });

  it('should expose a require() method that properly loads a module relative to root', function() {
    assert(pub.require);
    var testlib = pub.require('./lib/testlib.js');
    assert.equal(testlib, 'hello world');
  });

  it('should implement toString()', function() {
    assert(pub.toString);
    assert.equal(pub + '', root);
    assert.equal(pub.toString(), root);
  });

  it('should allow explicitly setting the root path with setPath()', function() {
    assert(pub.setPath);
    var originalPath = pub.toString();
    pub.setPath('/path/to');
    assert.equal(pub.resolve('somewhere'), '/path/to/somewhere');
    assert.equal(pub.path, '/path/to');
    pub.setPath(originalPath);
  });

  it('should expose the app root path as a .path property', function() {
    assert(pub.path);
    assert.equal(pub.path, pub.toString());
  });
});
