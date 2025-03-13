module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true, // Jest 환경 추가
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json', // tsconfig.json 경로 지정
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off', // TypeScript 버전 사용
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/react-in-jsx-scope': 'off', // React 17 이상에서는 불필요
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
  settings: {
    react: {
      version: 'detect', // React 버전 자동 감지
    },
  },
};
