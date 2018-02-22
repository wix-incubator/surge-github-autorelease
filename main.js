#!/usr/bin/env node

const program = require('commander');
const packageJson = require('./package.json');
const sgAutorelease = require('./sg-auto-release');

program
  .version(packageJson.version)
  .option('--repo [value]', 'Owner Name/Repo Name example: wix/wix-style-react')
  .option('--source-directory [value]', 'static files directory')
  .option('--root-path [value]', 'Root path to build agent root directory')
  .option('--pr [value]', 'Pull request number')
  .option('--github-token [value]', 'Github authentication token')
  .option('--surge-login [value]', 'Surge login')
  .option('--surge-token [value]', 'Surge token')
  .parse(process.argv);

const {repo, sourceDirectory, pr, githubToken, rootPath, surgeLogin, surgeToken} = program;
if (repo && sourceDirectory && pr && githubToken && rootPath && surgeToken && surgeLogin) {
  console.log(`Called with repo: ${repo} sourceDirectory: ${sourceDirectory} PR number: ${pr} Root path: ${rootPath}`);
  sgAutorelease({repo, sourceDirectory, pr, githubToken, rootPath});
} else {
  console.log('Usage: surge-github-autorelease -r wix/wix-style-react -s storybook-dist -b /home/travis/build -p 1455 -t ya65s2sjhd');
  console.log('One of the variable is missing, please try again');
}