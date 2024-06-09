module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  ignorePatterns: ['build/', 'public/', '/docs'],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/**/domain/**.*ts',
            from: './src/**/infra/**/*.ts',
          },
          {
            target: './src/**/domain/**.*ts',
            from: './src/**/usecases/**/*.ts',
          },
          {
            target: './src/**/domain/**.*ts',
            from: './src/**/app/**/*.ts',
          },
        ],
      },
    ],
  },
};
