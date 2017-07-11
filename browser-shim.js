import {dirname} from 'path';

export let path = dirname(require.main.filename);

export function resolve(pathToModule) {
  return path + pathToModule;
};

export function require(pathToModule) {
  return require(resolve(pathToModule));
};

export function toString() {
  return path;
};

export function setPath(explicitlySetPath) {
  path = explicitlySetPath;
};
