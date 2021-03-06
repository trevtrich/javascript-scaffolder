export default function ({scope, packageName, visibility}) {
  return {
    usage: `### Installation
${'Private' === visibility ? `
:warning: this is a private package, so you will need to use an npm token with
access to private packages under \`@${scope}\`
` : ''
}
\`\`\`sh
$ npm install ${packageName}
\`\`\`

### Example

run \`npm run generate:md\` to inject the usage example`
  };
}
