const rushLib = require('@microsoft/rush-lib');
const path = require('path');

const rushConfiguration = rushLib.RushConfiguration.loadFromDefaultLocation()

const scopes = ['common'];

rushConfiguration.projects.forEach(project => {
  scopes.push(project.packageName)
  const root = rushConfiguration.rushJsonFolder;
  const [, ...paths] = path.relative(root, project.projectFolder).split('/')
  const dirname = paths.join('-')
  scopes.push(dirname);
})

const allScope = ['common', ...rushConfiguration.projects.map(project => project.packageName)]

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', scopes],
  },
}
