// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    // React를 사용하는 경우
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // React를 사용하는 경우
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  // React를 사용하는 경우
  plugins: ['react'],
  rules: {
    // 프로젝트에 맞는 규칙 설정
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: true,
        tabWidth: 2,
        trailingComma: 'all',
        printWidth: 100,
        bracketSpacing: true,
        arrowParens: 'avoid',
      },
    ],
  },
};
