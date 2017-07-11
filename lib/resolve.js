// Dependencies
import path from 'path';

// Load global paths
import { globalPaths } from 'module';

// Guess at NPM's global install dir
let npmGlobalPrefix;
if ('win32' === process.platform) {
  npmGlobalPrefix = path.dirname(process.execPath);
} else {
  npmGlobalPrefix = path.dirname(path.dirname(process.execPath));
}
let npmGlobalModuleDir = path.resolve(npmGlobalPrefix, 'lib', 'node_modules');

// Save OS-specific path separator
let sep = path.sep;

// Resolver
export default function resolve(dirname) {
  // Check for environmental letiable
  if (process.env.APP_ROOT_PATH) {
    return path.resolve(process.env.APP_ROOT_PATH);
  }

  // Defer to main process in electron
  if ('type' in process && 'renderer' === process.type) {
    let remote = require('electron').remote;
    return remote.require('./').path;
  }

  let resolved = path.resolve(dirname);
  let alternateMethod = false;
  let appRootPath = null;

  // Make sure that we're not loaded from a global include path
  // Eg. $HOME/.node_modules
  //     $HOME/.node_libraries
  //     $PREFIX/lib/node
  globalPaths.forEach(function(globalPath) {
    if (!alternateMethod && 0 === resolved.indexOf(globalPath)) {
      alternateMethod = true;
    }
  });

  // If the app-root-path library isn't loaded globally,
  // and node_modules exists in the path, just split __dirname
  let nodeModulesDir = sep + 'node_modules';
  if (!alternateMethod && -1 !== resolved.indexOf(nodeModulesDir)) {
    let parts = resolved.split(nodeModulesDir);
    if (parts.length) {
      appRootPath = parts[0];
      parts = null;
    }
  }

  // If the above didn't work, or this module is loaded globally, then
  // resort to require.main.filename (See http://nodejs.org/api/modules.html)
  if (alternateMethod || null == appRootPath) {
    appRootPath = path.dirname(require.main.filename);
  }

  // Handle global bin/ directory edge-case
  if (alternateMethod && -1 !== appRootPath.indexOf(npmGlobalModuleDir) && (appRootPath.length - 4) === appRootPath.indexOf(sep + 'bin')) {
    appRootPath = appRootPath.slice(0, -4);
  }

  // Return
  return appRootPath;
}
