const path = require('path');
const { globalPaths } = require('module');

const nodeModules = 'node_modules';
/** Guess at NPM's global install dir */
const npmGlobalPrefix = process.platform === 'win32' ? path.dirname(process.execPath)
  : path.dirname(path.dirname(process.execPath));
const npmGlobalModuleDir = path.resolve(npmGlobalPrefix, nodeModules);
/** Save OS-specific path separator */
const { sep } = path;

/** Resolver */
module.exports = dirname => {
  /** Check for environmental letiable */
  if (process.env.APP_ROOT_PATH) {
    return path.resolve(process.env.APP_ROOT_PATH);
  }

  /** Defer to main process in electron */
  if ('type' in process && process.type === 'renderer') {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { remote } = require('electron'); // eslint-disable-line node/no-unpublished-require
    return remote.require('./').path;
  }

  const resolved = path.resolve(dirname);
  let alternateMethod = false;
  let appRootPath = null;

  /**
   * Make sure that we're not loaded from a global include path
   * Eg.  $HOME/.node_modules
   *      $HOME/.node_libraries
   *      $PREFIX/lib/node
   */
  globalPaths.forEach((globalPath) => {
    if (!alternateMethod && resolved.indexOf(globalPath) === 0) {
      alternateMethod = true;
    }
  });

  /**
   * If the app-root-path library isn't loaded globally,
   * and node_modules exists in the path, just split __dirname
   */
  const nodeModulesDir = `${sep}node_modules`;

  if (!alternateMethod && resolved.indexOf(nodeModulesDir) !== -1) {
    let parts = resolved.split(nodeModulesDir);

    if (parts.length) {
      // eslint-disable-next-line prefer-destructuring
      appRootPath = parts[0];
      parts = null;
    }
  }

  /**
   * If the above didn't work, or this module is loaded globally,
   * then resort to require.main.filename (See http://nodejs.org/api/modules.html)
   */
  if (alternateMethod || appRootPath == null) {
    appRootPath = path.dirname(require.main.filename);
  }

  /** Handle global bin/ directory edge-case */
  if (alternateMethod
    && appRootPath.indexOf(npmGlobalModuleDir) !== -1
    && (appRootPath.length - 4) === appRootPath.indexOf(`${sep}bin`)) {
    appRootPath = appRootPath.slice(0, -4);
  }

  return appRootPath;
};
