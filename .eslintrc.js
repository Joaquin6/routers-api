module.exports = {
    env: {
      node: true,
    },
    extends: [
      'airbnb-base',
      'plugin:node/recommended',
      'plugin:security/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2019,
      sourceType: 'module',
    },
    plugins: [
      'node',
      'security',
    ],
    rules: {
      'arrow-parens': ['off'],
      curly: ['error', 'all'],
      indent: ['error', 2, {
        MemberExpression: 1,
        SwitchCase: 1,
      }],
      'no-param-reassign': ['error', { props: false }],
      'object-curly-newline': ['error', { consistent: true }],
    },
};
