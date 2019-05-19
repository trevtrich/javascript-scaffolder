import {readFile} from 'mz/fs';
import {existsSync} from 'fs';
import {resolve} from 'path';
import {After, Before, Given, setWorldConstructor, Then, When} from 'cucumber';
import stubbedFs from 'mock-fs';
import any from '@travi/any';
import bddStdIn from 'bdd-stdin';
import sinon from 'sinon';
import {assert} from 'chai';
import {World} from '../support/world';
import {scaffold} from '../../../../src';
import {
  assertThatNpmConfigDetailsAreConfiguredCorrectlyFor,
  assertThatPackageDetailsAreConfiguredCorrectlyFor
} from './npm-steps';
import * as execa from '../../../../third-party-wrappers/execa';

setWorldConstructor(World);

let scaffoldResult;

Before(async function () {
  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('mock-stdin'); // eslint-disable-line import/no-extraneous-dependencies

  stubbedFs({
    templates: {
      'rollup.config.js': await readFile(resolve(__dirname, '../../../../', 'templates/rollup.config.js')),
      'canary-test.txt': await readFile(resolve(__dirname, '../../../../', 'templates/canary-test.txt')),
      'mocha-setup.txt': await readFile(resolve(__dirname, '../../../../', 'templates/mocha-setup.txt')),
      'cucumber.txt': await readFile(resolve(__dirname, '../../../../', 'templates/cucumber.txt'))
    }
  });

  this.sinonSandbox = sinon.createSandbox();
  this.sinonSandbox.stub(execa, 'default');

  this.transpileAndLint = true;
  this.visibility = any.fromList(['Public', 'Private']);
});

After(function () {
  stubbedFs.restore();
  this.sinonSandbox.restore();
});

Given(/^the default answers are chosen$/, async function () {
  this.unitTestAnswer = ['\n'];
  this.integrationTestAnswer = ['\n'];
  this.transpilationLintAnswer = null;
});

When(/^the project is scaffolded$/, async function () {
  bddStdIn(...[
    '\n',
    ...this.projectTypeAnswer,
    ...'Public' === this.visibility ? ['\n'] : [],
    '\n',
    '\n',
    '\n',
    '\n',
    ...this.unitTestAnswer,
    ...this.integrationTestAnswer,
    ...this.ciAnswer ? this.ciAnswer : [],
    ...'application' === this.projectType ? ['\n'] : [],
    ...this.transpilationLintAnswer ? this.transpilationLintAnswer : []
  ]);

  scaffoldResult = await scaffold({
    projectRoot: process.cwd(),
    projectName: any.word(),
    visibility: this.visibility,
    license: any.string(),
    vcs: this.vcs,
    configs: {
      eslint: {prefix: any.word(), packageName: any.word()},
      babelPreset: {name: any.word(), packageName: any.word()}
    },
    ciServices: {[any.word()]: {scaffolder: foo => ({foo}), public: true}}
  });
});

Then('the expected files for a(n) {string} are generated', async function (projectType) {
  const nvmRc = await readFile(`${process.cwd()}/.nvmrc`);

  assert.equal(nvmRc.toString(), this.latestLtsVersion);
  assert.equal(existsSync(`${process.cwd()}/.eslintrc.yml`), this.transpileAndLint);
  assert.equal(existsSync(`${process.cwd()}/.babelrc`), this.transpileAndLint);

  await assertThatPackageDetailsAreConfiguredCorrectlyFor(projectType, this.visibility);
  await assertThatNpmConfigDetailsAreConfiguredCorrectlyFor(projectType);
});

Then('the expected results for a(n) {string} are returned to the project scaffolder', async function (projectType) {
  assert.containsAllKeys(scaffoldResult.badges.contribution, ['commit-convention', 'commitizen']);

  assert.include(scaffoldResult.vcsIgnore.directories, '/node_modules/');
  assert.include(scaffoldResult.vcsIgnore.directories, '/lib/');
  if ('application' === projectType) assert.include(scaffoldResult.vcsIgnore.files, '.env');
  else assert.notInclude(scaffoldResult.vcsIgnore.files, '.env');
});
