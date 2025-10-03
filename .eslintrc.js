module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'react-hooks/exhaustive-deps': 'warn'
  },
  overrides: [
    {
      // Disable no-explicit-any for generated GraphQL types
      files: ['**/shopify-graphql.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};