const fs = require('fs');
const path = require('path');
const resolve = require('./lib').default;

function requirer(file) {
	let router = require(file);
	if (router.default && router.__esModule)
		return router.default;
	return router;
}

function generateTargetSource(target) {
	let source = resolve(target);
	source = source.path ? source.path : source;
	if (!source.endsWith(target)) return source + `/${target}`;
	return source;
}

/**
 * Check if target file is a hidden file
 * @param  {String} target
 * @return {Boolean}
 */
function isHidden(target) {
  /** remove file extension and normalize slashes */
  let file = path.normalize(target).replace(path.extname(target), '').split('/').pop();
  if (file.startsWith('.')) return true;
  return false;
}

class LoadRoutes {
	constructor (app, target = 'routes') {
		if (!(this instanceof LoadRoutes))
			return new LoadRoutes(app, target);
		this.init(app, target);
	}
	/**
	 * Inject the routes and routers into the express instance
	 * @param  {Express} app
	 * @param  {String} target
	 */
	init (app, target) {
		target = generateTargetSource(target = typeof target === 'string' ? target : 'routes');
		this.readdir(target).forEach(file => {
			if (isHidden(file)) return;
			let route = this.pathToRoute(file, target);
			let router = requirer(file);
			if (typeof router !== 'function') return;
			app.use(route, router);
		}, this);
	}
	/**
	 * Reads all the files and folder within a given target
	 * @param  {String} target
	 * @return {Array}
	 */
	readdir (target) {
		let files = [];

		if (typeof target !== 'string') throw new TypeError('Expecting target path to be a string');
		/** resolve the target path */
		if (target.startsWith('.'))
			target = path.resolve(path.dirname(module.parent.filename), target);
		/** return an empty array if target does not exists */
		if (!fs.existsSync(target)) return files;
		/** look for files recursively */
		fs.readdirSync(target).forEach(file => {
			if (isHidden(file)) return;
			let filePath = path.join(target, file);
			if (fs.lstatSync(filePath).isFile() && file.endsWith('.js')) files.push(filePath);
			else files.push.apply(files, this.readdir(filePath));
		}, this);

		return files;
	}
	/**
	 * Convert a file path into an express route
	 * @param  {String} path
	 * @param  {String} base
	 * @return {String}
	 */
	pathToRoute (target, base) {
		/** remove file extension and normalize slashes */
		target = path.normalize(target);
		target = target.replace(path.extname(target), '');

		if (base && typeof base === 'string') {
			target = target.split('/');
			base = path.normalize(base).split('/');
			base = base[base.length - 1];

			let segments = [], segment;
			for (let i = target.length - 1; i >= 0; i--) {
				segment = target[i];
				if (segment === base) break;
				/** check if segment is a hidden file or an index */
				if (i === target.length - 1 && segment === 'index') continue;
				if (segment !== '') segments.push(segment);
			}

			return '/' + segments.reverse().join('/');
		}
		/** without a base, use the last segment */
		target = path.basename(target);
		return '/' + (target !== 'index' ? target : '');
	}
}

/** export module */
export default LoadRoutes;
