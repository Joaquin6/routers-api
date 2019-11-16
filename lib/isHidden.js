const { extname, normalize } = require('path');

/**
 * Check if target file is a hidden file
 * @param  {String} target
 * @return {Boolean}
 */
const isHidden = target => (normalize(target).replace(extname(target), '').split('/').pop())
  .startsWith('.');

module.exports = isHidden;
