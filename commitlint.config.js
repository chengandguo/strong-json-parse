module.exports = {
  extends: ['@commitlint/config-conventional'],
  'type-case': [2, 'always', ['lower-case']],
  'type-enum': [2, 'always',['feat', 'fix', 'docs','style','refactor','perf','test', 'chore', 'revert']]
}