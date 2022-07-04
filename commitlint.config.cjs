module.exports = {
  rules: {
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'release',
      ],
    ],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 88],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 88],
  },
}
