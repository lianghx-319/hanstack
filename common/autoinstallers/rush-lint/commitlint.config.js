const rushLib = require('@microsoft/rush-lib')

const rushConfiguration = rushLib.RushConfiguration.loadFromDefaultLocation()

const allScope = ['common', ...rushConfiguration.projects.map(project => project.packageName)]

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', allScope],
  },
}
