module.exports = function lib(dirname = __dirname) {
  let path = require('path');
  let resolve = require('./resolve').default;
  let appRootPath = resolve(dirname);
  let publicInterface = {
    resolve: (pathToModule) => {
      return path.join(appRootPath, pathToModule);
    },

    require: (pathToModule) => {
      // Backwards compatibility check
      if ('function' === typeof pathToModule) {
        console.warn('Just use appRootPath.require() -- no need to pass in your ' +
               'modules\'s require() function any more.');
        return (pathToModule) => {
          return publicInterface.require(pathToModule);
        };
      }

      return require(publicInterface.resolve(pathToModule));
    },

    toString: () => {
      return appRootPath;
    },

    setPath: (explicitlySetPath) => {
      appRootPath = path.resolve(explicitlySetPath);
      publicInterface.path = appRootPath;
    },

    path: appRootPath
  };

  return publicInterface;
};
