# javascript-scaffolder

opinionated scaffolder for JavaScript projects

<!-- status badges -->

[![Build Status][ci-badge]][ci-link]
[![Codecov](https://img.shields.io/codecov/c/github/travi/javascript-scaffolder.svg)](https://codecov.io/github/travi/javascript-scaffolder)

## Table of Contents

* [Features](#features)
* [Usage](#usage)
  * [Installation](#installation)
  * [As one of the languages for scaffolding a project](#as-one-of-the-languages-for-scaffolding-a-project)
    * [Example](#example)
    * [Options](#options)
      * [projectRoot string (required)](#projectroot-string-required)
      * [projectName string (required)](#projectname-string-required)
      * [visibility string (required)](#visibility-string-required)
      * [license string (required)](#license-string-required)
      * [vcs object (required)](#vcs-object-required)
      * [description string (optional)](#description-string-optional)
      * [configs object (optional)](#configs-object-optional)
      * [overrides object (optional)](#overrides-object-optional)
      * [ciServices object (optional)](#ciservices-object-optional)
* [Contributing](#contributing)
  * [Dependencies](#dependencies)
  * [Verification](#verification)
* [Related Projects](#related-projects)

## Features

* Sets the [node.js](https://nodejs.org/) version to the latest or LTS version
  (your choice) using [nvm](https://github.com/creationix/nvm)
* Scaffolds the `package.json`
  * Enables linting of:
    * JavaScript with [ESLint](https://eslint.org/)
    * The `.travis.yml` using [`travis.rb`](https://github.com/travis-ci/travis.rb#lint),
      when [Travis](https://travis-ci.com) is the chosen CI
  * enables updating the lockfile for [Greenkeeper](https://greenkeeper.io) PRs
* Enables transpilation with [Babel](https://babeljs.io)
* Defines and enforces the [commit message convention](https://conventionalcommits.org/)
* Defines [badges](https://shields.io) for inclusion in the `README.md`
* Defines files to be ignored from `git` and `npm`
* Scaffolds CI service config from the user choice of the
  [provided scaffolders](#ciservices-object-optional)

## Usage

<!-- consumer badges -->

[![npm][npm-badge]][npm-link]
[![MIT license][license-badge]][license-link]

### Installation

```sh
$ npm install @travi/javascript-scaffolder -S
```

### As one of the languages for scaffolding a project

This scaffolder is intended to be used to scaffold the
[language specific details](https://github.com/travi/project-scaffolder#languages-optional)
within the [project-scaffolder](https://github.com/travi/project-scaffolder).

#### Example

```js
import program from 'commander';
import {scaffold} from '@travi/project-scaffolder';
import {scaffold as scaffoldJavaScript} from '@travi/javascript-scaffolder';

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold({
    languages: {
      JavaScript: options => scaffoldJavaScript({
        ...options,
        configs: {
          eslint: {prefix: '@travi/travi', packageName: '@travi/eslint-config-travi'},
          commitlint: {name: 'travi', packageName: 'commitlint-config-travi'},
          babelPreset: {name: 'travi', packageName: 'babel-preset-travi'}
        }
      })
    }, 
    overrides: {copyrightHolder: 'Matt Travi'}
  }).catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
```

#### Options

##### `projectRoot` __string__ (_required_)

path to the root of the project

##### `projectName` __string__ (_required_)

name of the project (w/o a [scope](https://docs.npmjs.com/misc/scope))

##### `visibility` __string__ (_required_)

visibility of the project (`Public` or `Private`)

##### `license` __string__ (_required_)

##### `vcs` __object__ (_required_)

* `host` __string__ (_required_)
  VCS hosting service
* `owner` __string__ (_required_)
  account name on the host service for the repository
* `name` __string__ (_required_)
  repository name 

##### `description` __string__ (_optional_)

short summary of the project

##### `configs` __object__ (_optional_)

* `eslint`: __object__ (_optional_)
  details about the [shareable config](https://eslint.org/docs/developer-guide/shareable-configs)
  to be used for the project

  * `packageName` __string__ (_required_)
    name of the `npm` package
  * `prefix` __string__ (_required_)
    name to be used when referring to the config within the `.eslintrc` files

  :warning: while i'm not confident that it is the recommended convention, it
  is assumed the defined config has a `rules/` directory exposed from the package
  with rulesets defined for

  * `es6.js`
  * `tests/base.js`
  * `tests/mocha.js`

* `commitlint` __object__ (_optional_)
  details about the [shareable config](https://marionebl.github.io/commitlint/#/concepts-shareable-config)
  to be used for the project
  * `packageName` __string__ (_required_)
    name of the `npm` package
  * `name` __string__ (_required_)
    name to be used when referring to the config within the `.commitlintrc.js` file
* `babelPreset` __object__ (_optional_)
  details about the [preset](https://babeljs.io/docs/plugins/#creating-a-preset)
  to be used for the project
  * `packageName` __string__ (_required_)
    name of the `npm` package
  * `name` __string__ (_required_)
    shorthand name to be used when referring to the config

##### `overrides` __object__ (_optional_)

* `npmAccount` __string__ (_optional_)
  the account the package should be published under. used to suggest a
  [scope](https://docs.npmjs.com/misc/scope). defaults to `$ npm whoami`
* `author` __object__ (_optional_)
  [details](https://docs.npmjs.com/files/package.json#people-fields-author-contributors)
  about the package author

  * `name` __string__ (_required_) defaults to `$npm config get init.author.name`
  * `email` __string__ (_optional_) defaults to `$npm config get init.author.email`
  * `url` __string__ (_optional_) defaults to `$npm config get init.author.url`

##### `ciServices` __object__ (_optional_)

* keys: __string__ Name of the service
* values: __object__
  * `scaffolder`: __function__ (_required_) scaffolds the ci service options
  * `public`: __boolean__ (_optional_) whether this service should be presented
    as a public option
  * `private`: __boolean__ (_optional_) whether this service should be presented
    as a private option

## Contributing

<!-- contribution badges -->

[![Conventional Commits][commit-convention-badge]][commit-convention-link]
[![Commitizen friendly][commitizen-badge]][commitizen-link]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/travi/javascript-scaffolder.svg)](https://greenkeeper.io/)
[![PRs Welcome][prs-badge]][prs-link]

### Dependencies

```sh
$ nvm install
$ npm install
```

### Verification

```sh
$ npm test
```

## Related Projects

* [project-scaffolder](https://npm.im/@travi/project-scaffolder)
* [scaffolder-sub-command](https://github.com/travi/scaffolder-sub-command)
* [travis-scaffolder-javascript](https://github.com/travi/travis-scaffolder-javascript)
* [cli](https://npm.im/@travi/cli)

[npm-link]: https://www.npmjs.com/package/@travi/javascript-scaffolder

[npm-badge]: https://img.shields.io/npm/v/@travi/javascript-scaffolder.svg

[license-link]: LICENSE

[license-badge]: https://img.shields.io/github/license/travi/javascript-scaffolder.svg

[ci-link]: https://travis-ci.org/travi/javascript-scaffolder

[ci-badge]: https://img.shields.io/travis/travi/javascript-scaffolder.svg?branch=master

[commit-convention-link]: https://conventionalcommits.org

[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg

[commitizen-link]: http://commitizen.github.io/cz-cli/

[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[prs-link]: http://makeapullrequest.com

[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
