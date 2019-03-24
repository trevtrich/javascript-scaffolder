import scaffoldCommitlint from './commitlint';

export default async function ({projectRoot, configs}) {
  if (configs.commitlint) {
    const commitlintResult = await scaffoldCommitlint({projectRoot, config: configs.commitlint});

    return {devDependencies: commitlintResult.devDependencies, scripts: {}, vcsIgnore: {files: [], directories: []}};
  }

  return {devDependencies: [], scripts: {}, vcsIgnore: {files: [], directories: []}};
}