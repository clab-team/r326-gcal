module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'no-undef': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    'prettier/prettier': [
      'error',
      {
        'semi': false,
        'singleQuote': true
      }
    ]
  }
}
