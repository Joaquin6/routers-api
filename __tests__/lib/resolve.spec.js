const path = require('path');
const { globalPaths } = require('module');
const resolve = require('../../lib/resolve');

describe('The path resolution method', () => {
  const originalReqMainFilename = require.filename || 'path/to/electron';

  /** Make sure env variable isn't set for tests */
  if (process.env.APP_ROOT_PATH) {
    delete process.env.APP_ROOT_PATH;
  }

  beforeEach(() => {
    if (!require.main) {
      require.main = {};
    }
    require.filename = originalReqMainFilename;
  });

  afterEach(() => {
    if (!require.main) {
      require.main = {};
    }
    require.filename = originalReqMainFilename;
  });

  /** Check global paths */
  it('should use require.filename if the path is in the globalPaths array', () => {
    const expected = path.dirname(require.filename);

    globalPaths.forEach(globalPath => {
      let testPath = `${globalPath}${path.sep}routers-api`;

      if (testPath.includes('/lib/node/routers-api')) {
        testPath = testPath.replace('/lib/node/routers-api', '/lib/node_modules/routers-api');
      }

      // eslint-disable-next-line no-console
      console.log(testPath);

      expect(resolve(testPath)).toEqual(expected);
    });
  });

  /** Check bin/ dir in global path */
  it('should correctly handle the global bin/ edge case', () => {
    const prefix = resolve(path.dirname(path.dirname(process.execPath)), 'lib', 'node_modules');
    const testPath = `${prefix}/__tests__/bin/cli.js`;
    const expected = `${prefix}/__tests__/lib`;

    require.filename = testPath;

    expect(resolve(testPath)).toEqual(expected);
  });

  /** Check some standard path layouts */
  it('should use String.split() in common cases', () => {
    const expected = '/var/www';
    const cases = [
      `${expected}/node_modules/routers-api`,
      `${expected}/node_modules/somemodule/node_modules/routers-api`,
      `${expected}/node_modules/somemodule/node_modules/someothermodules/node_modules/routers-api`,
      `${expected}/node_modules/.bin`,
      `${expected}/node_modules/bin`,
    ];

    cases.forEach(testPath => expect(resolve(testPath)).toEqual(expected));
  });

  /** Check root path */
  it('should still use String.split() in the root directory', () => {
    expect(resolve('/node_modules')).toEqual('');
  });

  /** Check unexpected path */
  it('should use require.filename on unexpected input', () => {
    const expected = path.dirname(module.filename);
    [
      'just-some-jibberish',
      '/var/www/libs/routers-api',
      'path/from/electron',
    ].forEach(testPath => expect(resolve(testPath)).toEqual(expected));
  });

  /** Check when setting via environmental variable */
  it('should respect the APP_ROOT_PATH environmental variable', () => {
    const expected = '/some/arbirary/path';
    process.env.APP_ROOT_PATH = expected;

    expect(resolve('/somewhere/else')).toEqual(expected);

    delete process.env.APP_ROOT_PATH;
  });

  it('should defer to the main process inside an electron renderer process', () => {
    global.window = { process: { type: 'renderer' } };

    let lastRemoteModule = null;

    // Set up mock
    jest.mock('electron', () => ({
      remote: {
        require: moduleName => {
          lastRemoteModule = moduleName;
          return {
            path: 'path/from/electron',
          };
        },
      },
    }));

    // Run test
    expect(resolve('funky')).toEqual(__dirname);
    expect(lastRemoteModule).toEqual(lastRemoteModule);

    // Tear down mock
    jest.unmock('electron');
    delete global.window;
  });
});

describe('The public interface', () => {
  const lib = require('../../lib');
  const root = path.resolve(__dirname);
  const pub = lib(`${root}/node_modules/routers-api`);

  it('should expose a resolve() method that resolves a relative path to the root path', () => {
    expect(pub.resolve).toBeTruthy();
    expect(pub.resolve('subdir/filename.js')).toEqual(`${root}/subdir/filename.js`);
  });

  it('should expose a require() method that properly loads a module relative to root', () => {
    expect(pub.require).toBeTruthy();
    expect(pub.require('./testlib.js')).toEqual('hello world');
  });

  it('should implement toString()', () => {
    expect(pub.toString).toBeTruthy();
    expect(`${pub}`).toEqual(root);
    expect(pub.toString()).toEqual(root);
  });

  it('should allow explicitly setting the root path with setPath()', () => {
    expect(pub.setPath).toBeTruthy();

    const originalPath = pub.toString();
    pub.setPath('/path/to');

    expect(pub.resolve('somewhere')).toEqual('/path/to/somewhere');
    expect(pub.path).toEqual('/path/to');

    pub.setPath(originalPath);
  });

  it('should expose the app root path as a .path property', () => {
    expect(pub.path).toBeTruthy();
    expect(pub.path).toEqual(pub.toString());
  });
});
