const path = require('path');
const resolve = require('./resolve');
const isHidden = require('./isHidden');

module.exports = (dirname = __dirname) => {
  let appRootPath = resolve(dirname);

  const publicInterface = {
    isHidden,
    resolve: pathToModule => path.join(appRootPath, pathToModule),
    require: pathToModule => {
      /** Backwards compatibility check */
      if (typeof pathToModule === 'function') {
        // eslint-disable-next-line no-console
        console.warn(`
          Just use appRootPath.require() -- no need to pass in your
            modules's require() function any more.
        `);

        return pathToModuleChild => publicInterface.require(pathToModuleChild);
      }

      return require(publicInterface.resolve(pathToModule));
    },

    toString: () => appRootPath,

    setPath: explicitlySetPath => {
      appRootPath = path.resolve(explicitlySetPath);
      publicInterface.path = appRootPath;
    },

    path: appRootPath,
  };

  return publicInterface;
};
