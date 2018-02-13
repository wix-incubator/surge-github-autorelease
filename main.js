#!/usr/bin/env node

const program = require('commander');
const packageJson = require('./package.json');
const sgAutoRelease = require('./sg-auto-release');

program
  .version(packageJson.version)
  .option('-r, --repo', 'Owner Name/Repo Name example: wix/wix-style-react')
  .option('-s, --source-directory', 'static files directory')
  .option('-p, --pr', 'Pull request number')
  .option('-t, --github-token', 'Github authentication token')
  .parse(process.argv);

const {repo, sourceDirectory, pr, githubToken} = program;
if (repo && sourceDirectory && pr && githubToken) {
  sgAutoRelease({repo, sourceDirectory, pr, githubToken});
} else {
  console.log('Usage: surge-github-autorelease -r wix/wix-style-react -s storybook-dist -p 1455 -t ya65s2sjhd');
  console.log('One of the variable is missing, please try again');
}