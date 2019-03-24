import path from 'path';
import fs from 'mz/fs';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as prompts from '../../src/prompts/questions';
import * as installer from '../../src/package/install';
import * as optionsValidator from '../../src/options-validator';
import * as ci from '../../src/ci';
import * as testing from '../../src/testing/scaffolder';
import * as host from '../../src/host';
import * as babel from '../../src/config/babel';
import * as linting from '../../src/linting/scaffolder';
import * as husky from '../../src/config/husky';
import * as npmConfig from '../../src/config/npm';
import * as commitizen from '../../src/config/commitizen';
import * as documentation from '../../src/documentation';
import * as nodeVersionHandler from '../../src/node-version';
import * as badgeDetailsBuilder from '../../src/badges';
import * as vcsIgnoresBuilder from '../../src/vcs-ignore';
import * as commitConvention from '../../src/commit-convention/scaffolder';
import * as packageScaffolder from '../../src/package/scaffolder';
import {scaffold} from '../../src/scaffolder';
import {questionNames} from '../../src/prompts/question-names';

suite('javascript project scaffolder', () => {
  let sandbox;
  const options = any.simpleObject();
  const ciServices = any.simpleObject();
  const hosts = any.simpleObject();
  const projectRoot = any.string();
  const projectName = any.string();
  const packageName = any.string();
  const homepage = any.url();
  const visibility = any.fromList(['Private', 'Public']);
  const version = any.string();
  const commitConventionDevDependencies = any.listOf(any.string);
  const hostResults = any.simpleObject();
  const babelResults = any.simpleObject();
  const commitizenResults = any.simpleObject();
  const huskyResults = any.simpleObject();
  const chosenHost = any.word();
  const projectType = any.word();
  const scope = any.word();
  const license = any.string();
  const authorName = any.string();
  const authorEmail = any.string();
  const authorUrl = any.url();
  const integrationTested = any.boolean();
  const unitTested = any.boolean();
  const tests = {unit: unitTested, integration: integrationTested};
  const vcsDetails = any.simpleObject();
  const chosenCiService = any.word();
  const overrides = any.simpleObject();
  const description = any.sentence();
  const babelPresetName = any.string();
  const babelPreset = {name: babelPresetName};
  const configs = {babelPreset, ...any.simpleObject()};
  const versionCategory = any.word();
  const testingResults = any.simpleObject();
  const lintingResults = any.simpleObject();
  const ciServiceResults = any.simpleObject();
  const commitConventionResults = any.simpleObject();
  const contributors = [
    hostResults,
    testingResults,
    lintingResults,
    ciServiceResults,
    babelResults,
    commitizenResults,
    commitConventionResults,
    huskyResults
  ];
  const packageScaffoldingInputs = {
    projectRoot,
    projectType,
    contributors,
    projectName,
    visibility,
    scope,
    license,
    tests,
    vcs: vcsDetails,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    ci: chosenCiService,
    description,
    configs
  };
  const commonPromptAnswers = {
    [questionNames.NODE_VERSION_CATEGORY]: any.word(),
    [questionNames.PROJECT_TYPE]: projectType,
    [questionNames.UNIT_TESTS]: unitTested,
    [questionNames.INTEGRATION_TESTS]: integrationTested,
    [questionNames.SCOPE]: scope,
    [questionNames.PROJECT_TYPE]: projectType,
    [commonQuestionNames.UNIT_TESTS]: tests.unit,
    [questionNames.INTEGRATION_TESTS]: tests.integration,
    [questionNames.AUTHOR_NAME]: authorName,
    [questionNames.AUTHOR_EMAIL]: authorEmail,
    [questionNames.AUTHOR_URL]: authorUrl,
    [commonQuestionNames.CI_SERVICE]: chosenCiService,
    [questionNames.HOST]: chosenHost,
    [questionNames.NODE_VERSION_CATEGORY]: versionCategory
  };

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(installer, 'default');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(optionsValidator, 'validate');
    sandbox.stub(ci, 'default');
    sandbox.stub(testing, 'default');
    sandbox.stub(host, 'default');
    sandbox.stub(babel, 'default');
    sandbox.stub(linting, 'default');
    sandbox.stub(husky, 'default');
    sandbox.stub(npmConfig, 'default');
    sandbox.stub(commitizen, 'default');
    sandbox.stub(documentation, 'default');
    sandbox.stub(nodeVersionHandler, 'determineLatestVersionOf');
    sandbox.stub(nodeVersionHandler, 'install');
    sandbox.stub(badgeDetailsBuilder, 'default');
    sandbox.stub(vcsIgnoresBuilder, 'default');
    sandbox.stub(commitConvention, 'default');
    sandbox.stub(packageScaffolder, 'default');

    fs.writeFile.resolves();
    fs.copyFile.resolves();
    packageScaffolder.default
      .withArgs(packageScaffoldingInputs)
      .resolves({...any.simpleObject(), name: packageName, homepage});
    prompts.prompt.withArgs(overrides, ciServices, hosts, visibility, vcsDetails).resolves(commonPromptAnswers);
    ci.default
      .withArgs(
        ciServices,
        chosenCiService,
        {
          projectRoot,
          vcs: vcsDetails,
          visibility,
          packageType: projectType,
          nodeVersion: version,
          tests
        }
      )
      .resolves(ciServiceResults);
    host.default.withArgs(hosts, chosenHost).resolves(hostResults);
    testing.default.withArgs({projectRoot, tests, visibility}).resolves(testingResults);
    linting.default.withArgs({configs, projectRoot, tests, vcs: vcsDetails}).resolves(lintingResults);
    commitizen.default.withArgs({projectRoot}).resolves(commitizenResults);
    babel.default.withArgs({projectRoot, preset: babelPreset}).resolves(babelResults);
    husky.default.withArgs({projectRoot}).resolves(huskyResults);
    npmConfig.default.resolves();
    commitConvention.default.withArgs({projectRoot, configs}).resolves(commitConventionResults);
    nodeVersionHandler.determineLatestVersionOf.withArgs(versionCategory).returns(version);
    optionsValidator.validate
      .withArgs(options)
      .returns({
        visibility,
        projectRoot,
        configs,
        ciServices,
        overrides,
        hosts,
        projectName,
        license,
        vcs: vcsDetails,
        description
      });
  });

  teardown(() => sandbox.restore());

  suite('config files', () => {
    test('that config files are created', async () => {
      await scaffold(options);

      assert.calledWith(babel.default, {preset: babelPreset, projectRoot});
      assert.calledWith(npmConfig.default, {projectRoot, projectType});
      assert.calledWith(nodeVersionHandler.install, versionCategory);
    });

    suite('build', () => {
      suite('application', () => {
        test('that rollup is not configured', async () => {
          const applicationProjectType = 'Application';
          prompts.prompt
            .withArgs(overrides, ciServices, hosts, visibility, vcsDetails)
            .resolves({...commonPromptAnswers, [questionNames.PROJECT_TYPE]: applicationProjectType});
          packageScaffolder.default
            .withArgs({...packageScaffoldingInputs, projectType: applicationProjectType})
            .resolves(any.simpleObject());
          ci.default
            .withArgs(
              ciServices,
              chosenCiService,
              {
                projectRoot,
                vcs: vcsDetails,
                visibility,
                packageType: applicationProjectType,
                nodeVersion: version,
                tests
              }
            )
            .resolves(ciServiceResults);

          await scaffold(options);

          assert.neverCalledWith(fs.copyFile, path.resolve(__dirname, '../../', 'templates', 'rollup.config.js'));
        });
      });

      suite('package', () => {
        test('that the package gets bundled with rollup', async () => {
          const packageProjectType = 'Package';
          prompts.prompt
            .withArgs(overrides, ciServices, hosts, visibility, vcsDetails)
            .resolves({...commonPromptAnswers, [questionNames.PROJECT_TYPE]: packageProjectType});
          packageScaffolder.default
            .withArgs({...packageScaffoldingInputs, projectType: packageProjectType})
            .resolves(any.simpleObject());
          ci.default
            .withArgs(
              ciServices,
              chosenCiService,
              {
                projectRoot,
                vcs: vcsDetails,
                visibility,
                packageType: packageProjectType,
                nodeVersion: version,
                tests
              }
            )
            .resolves(ciServiceResults);

          await scaffold(options);

          assert.calledWith(
            fs.copyFile,
            path.resolve(__dirname, '../../', 'templates', 'rollup.config.js'),
            `${projectRoot}/rollup.config.js`
          );
        });
      });
    });
  });

  suite('data passed downstream', () => {
    suite('badges', () => {
      test('that badges are provided', async () => {
        const builtBadges = any.simpleObject();
        badgeDetailsBuilder.default
          .withArgs(visibility, projectType, packageName, ciServiceResults, unitTested, vcsDetails)
          .returns(builtBadges);

        const {badges} = await scaffold(options);

        assert.equal(badges, builtBadges);
      });
    });

    suite('vcs ignore', () => {
      test('that ignores are defined', async () => {
        const ignores = any.simpleObject();
        vcsIgnoresBuilder.default
          .withArgs({host: hostResults, linting: lintingResults, testing: testingResults, projectType})
          .returns(ignores);
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});

        const {vcsIgnore} = await scaffold(options);

        assert.equal(vcsIgnore, ignores);
      });
    });

    suite('verification', () => {
      test('that `npm test` is defined as the verification command', async () => {
        const {verificationCommand} = await scaffold(options);

        assert.equal(verificationCommand, 'npm test');
      });
    });

    suite('project details', () => {
      test('that details are passed along', async () => {
        const {projectDetails} = await scaffold(options);

        assert.equal(projectDetails.homepage, homepage);
      });

      test('that details are not passed along if not defined', async () => {
        packageScaffolder.default.withArgs(packageScaffoldingInputs).resolves(any.simpleObject());

        const {projectDetails} = await scaffold(options);

        assert.isUndefined(projectDetails.homepage);
      });
    });

    suite('documentation', () => {
      test('that appropriate documentation is passed along', async () => {
        const docs = any.simpleObject();
        documentation.default.withArgs({projectType, packageName, visibility, scope}).returns(docs);
        optionsValidator.validate
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices, scope});

        const {documentation: documentationContent} = await scaffold(options);

        assert.equal(documentationContent, docs);
      });
    });
  });
});
