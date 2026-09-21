const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

const forbid = (...groups) => ['error', { patterns: groups }];

const noComments = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      comment:
        'Comments are not allowed in this project (CLAUDE.md section 11). Rename or extract instead.',
    },
  },
  create(context) {
    return {
      'Program:exit'() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: 'comment' });
        }
      },
    };
  },
};

const projectPlugin = { rules: { 'no-comments': noComments } };

const boundary = {
  features: {
    group: ['@features/*'],
    message: 'Features must not import other features. Move shared code to core/ or shared/.',
  },
  environments: {
    group: ['@environments/*', '**/environments/**'],
    message: 'Read configuration in app.config.ts and pass it in.',
  },
};

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: { tofan: projectPlugin },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'tofan/no-comments': 'error',
      '@typescript-eslint/no-explicit-any': [
        'error',
        { fixToUnknown: false, ignoreRestArgs: false },
      ],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'app', style: 'kebab-case' },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public', overrides: { constructors: 'off' } },
      ],
    },
  },
  {
    files: ['src/app/core/**/*.ts', 'src/app/shared/**/*.ts', 'src/app/features/**/*.ts'],
    rules: {
      'no-restricted-imports': forbid(boundary.features, boundary.environments),
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    plugins: { tofan: projectPlugin },
    rules: {
      'tofan/no-comments': 'error',
      '@angular-eslint/template/no-any': 'error',
    },
  },
]);
