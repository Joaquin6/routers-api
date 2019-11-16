module.exports = {
  bail: true,
  verbose: true,
  runner: '@jest-runner/electron/main',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  globals: {
    DEBUG: true,
    NODE_ENV: 'test',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**', '!**/node_modules/**',
  ],
  modulePathIgnorePatterns: ['./__tests__/lib/testlib.js'],
};
