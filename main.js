#!/usr/bin/env node

const program = require('commander');
const packageJson = require('./package.json');
const sgAutorelease = require('./sg-auto-release');

program
  .version(packageJson.version)
  .option('-r, --repo [type]', 'Owner Name/Repo Name example: wix/wix-style-react')
  .option('-s, --source-directory [type]', 'static files directory')
  .option('-b, --root-path [type]', 'Root path to build agent root directory')
  .option('-p, --pr [type]', 'Pull request number (not mandatory)')
  .option('-t, --github-token [type]', 'Github authentication token')
  .parse(process.argv);

const {repo, sourceDirectory, pr, githubToken, rootPath} = program;
if (repo && sourceDirectory && githubToken && rootPath) {
  console.log(`Called with repo: ${repo} sourceDirectory: ${sourceDirectory} PR number: ${pr} Root path: ${rootPath}`);
  sgAutorelease({repo, sourceDirectory, pr, githubToken, rootPath});
} else {
  console.log('Usage: surge-github-autorelease -r wix/wix-style-react -s storybook-dist -b /home/travis/build -p 1455 -t ya65s2sjhd');
  console.log('One of the variables is missing, please try again');
}
