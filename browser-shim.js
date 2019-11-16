/* eslint-disable no-use-before-define */
/* eslint-disable security/detect-non-literal-require, import/no-dynamic-require */
const { dirname } = require('path');

function resolve(pathToModule) {
  return path + pathToModule;
}

function require(pathToModule) {
  return require(resolve(pathToModule));
}

let path = dirname(require.main.filename);

const toString = () => path;

const setPath = (explicitlySetPath = __dirname) => {
  path = explicitlySetPath;
};

module.exports = {
  path,
  resolve,
  require,
  toString,
  setPath,
};
