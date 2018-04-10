#!/usr/bin/env node

const program = require('commander');
const packageJson = require('./package.json');
const sgAutorelease = require('./sg-auto-release');

program
  .version(packageJson.version)
  .option('-o, --repo-owner [type]', 'Repo Owner. Example: wix')
  .option('-n, --repo-name [type]', 'name of repository')
  .option('-s, --source-directory [type]', 'static files directory')
  .option('-b, --root-path [type]', 'Root path to build agent root directory', '.')
  .option('-p, --pr [type]', 'Pull request number', 'commit')
  .option('-t, --github-token [type]', 'Github authentication token')
  .parse(process.argv);

const {repoOwner, repoName, sourceDirectory, pr, githubToken, rootPath} = program;
if (repoOwner && repoName && sourceDirectory && pr && githubToken && rootPath) {
  console.log(`Called with:
    repoOwner: ${repoOwner}, repoName: ${repoName} sourceDirectory: ${sourceDirectory}
    PR number: ${pr} Root path: ${rootPath}`);
  sgAutorelease({repo: `${repoOwner}/${repoName}`, sourceDirectory, pr, githubToken, rootPath});
} else {
  console.log('Usage: surge-github-autorelease -r wix/wix-style-react -s storybook-dist -b /home/travis/build -p 1455 -t ya65s2sjhd');
  console.log('One of the variable is missing, please try again');
}
