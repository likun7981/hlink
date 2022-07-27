module.exports = {
  rules: {
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-enum': [
      2,
      'always',
      ['app', 'cli', 'core', 'scripts', 'docker', 'other'],
    ],
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
