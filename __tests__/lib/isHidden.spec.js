const path = require('path');

const isHidden = require('../../lib/isHidden');

describe('Check if target file is a hidden file', () => {
  it('should detect a hidden file', () => {
    expect(isHidden(path.resolve(__dirname, '.hidden-test.txt'))).toBeTruthy();
  });
});
