import {promises as fsPromises} from 'fs';

export default async function ({config, projectRoot, projectType, vcs}) {
  await fsPromises.writeFile(
    `${projectRoot}/.remarkrc.js`,
    `// https://github.com/remarkjs/remark/tree/master/packages/remark-stringify#options
exports.settings = {
  listItemIndent: 1,
  emphasis: '_',
  strong: '_',
  bullet: '*',
  incrementListMarker: false
};

exports.plugins = [
  '${config}',
  [require('remark-toc'), {tight: true}]${
  'Package' === projectType
    ? `,
  ['remark-usage', {heading: 'example', main: './src'}]`
    : ''
}${
  !vcs
    ? `,
  ['validate-links', {repository: false}]`
    : ''
}
];`
  );

  return {
    devDependencies: [config, 'remark-cli', 'remark-toc'],
    scripts: {
      'lint:md': 'remark . --frail',
      'generate:md': 'remark . --output'
    }
  };
}
