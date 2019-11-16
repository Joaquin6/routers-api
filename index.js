const { existsSync, readdirSync, lstatSync } = require('fs');
const { basename, dirname, extname, join, resolve: pathResolve, normalize } = require('path');
const resolve = require('./lib/resolve');
const isHidden = require('./lib/isHidden');

function requirer(file) {
  const router = require(file);
  return router.default && router.__esModule ? router.default : router;
}

module.exports.requirer = requirer;

function generateTargetSource(target) {
  let source = resolve(target);
  source = source.path ? source.path : source;
  return !source.endsWith(target) ? `${source}/${target}` : source;
}

module.exports.generateTargetSource = generateTargetSource;

/** export module */
class LoadRoutes {
  constructor(app, target = 'routes') {
    if (!(this instanceof LoadRoutes)) {
      return new LoadRoutes(app, target);
    }

    this.init(app, target);
  }

  /**
	 * Inject the routes and routers into the express instance
	 * @param  {Express} app
	 * @param  {String} target
	 */
  init(app, target) {
    let trgt = typeof target === 'string' ? target : 'routes';
    trgt = generateTargetSource(trgt);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    this.readdir(trgt).forEach(file => {
      if (isHidden(file)) {
        return;
      }

      const route = this.pathToRoute(file, trgt);
      const router = requirer(file);

      if (typeof router !== 'function') {
        return;
      }

      app.use(route, router);
    }, this);
  }

  /**
	 * Reads all the files and folder within a given target
	 * @param  {String} target
	 * @return {Array}
	 */
  readdir(target) {
    if (typeof target !== 'string') {
      throw new TypeError('Expecting target path to be a string');
    }

    let files = [];
    let trgt = target;

    /** resolve the target path */
    if (trgt.startsWith('.')) {
      trgt = pathResolve(dirname(module.parent.filename), trgt);
    }

    /** return an empty array if trgt does not exists */
    if (!existsSync(trgt)) {
      return files;
    }

    /** look for files recursively */
    readdirSync(trgt).forEach(file => {
      if (isHidden(file)) {
        return;
      }

      const filePath = join(trgt, file);

      if (lstatSync(filePath).isFile() && file.endsWith('.js')) {
        files.push(filePath);
      } else {
        files = [...files, this.readdir(filePath)];
      }
    }, this);

    return files;
  }

  /**
	 * Convert a file path into an express route
	 * @param  {String} path
	 * @param  {String} base
	 * @return {String}
	 */
  pathToRoute(target, base) {
    let bse = base;
    /** remove file extension and normalize slashes */
    let trgt = normalize(target);
    trgt = trgt.replace(extname(trgt), '');

    if (bse && typeof bse === 'string') {
      trgt = trgt.split('/');
      bse = normalize(bse).split('/');
      bse = bse[bse.length - 1];

      const segments = [];
      let segment;

      // eslint-disable-next-line no-plusplus
      for (let i = trgt.length - 1; i >= 0; i--) {
        // eslint-disable-next-line security/detect-object-injection
        segment = trgt[i];

        if (segment === bse) {
          break;
        }

        /** check if segment is a hidden file or an index */
        if (i === trgt.length - 1 && segment === 'index') {
          // eslint-disable-next-line no-continue
          continue;
        }

        if (segment !== '') {
          segments.push(segment);
        }
      }

      return `/${segments.reverse().join('/')}`;
    }
    /** without a base, use the last segment */
    trgt = basename(trgt);
    return `/${trgt !== 'index' ? trgt : ''}`;
  }
}

module.exports = LoadRoutes;
