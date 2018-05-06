#!/usr/bin/env node

const program = require('commander');
const packageJson = require('./package.json');
const sgAutorelease = require('./sg-auto-release');

program
  .version(packageJson.version)
  .option('-o, --repo-owner [type]', 'Repo Owner Name example: wix')
  .option('-n, --repo-name [type]', 'Repo Name example: wix-style-react')
  .option('-s, --source-directory [type]', 'static files directory')
  .option('-b, --root-path [type]', 'Root path to build agent root directory')
  .option('-p, --pr [type]', 'Pull request number (not mandatory)')
  .option('-t, --github-token [type]', 'Github authentication token')
  .option('-d, --domain [domain]', 'Domain to deploy to, example: wix-wix-style-react')
  .parse(process.argv);

const {repoOwner, repoName, sourceDirectory, pr, githubToken, rootPath, domain} = program;
if (repoOwner && repoName && sourceDirectory && githubToken && rootPath && domain) {
  console.log(`Called with repoOwner: ${repoOwner} repoName: ${repoName} sourceDirectory: ${sourceDirectory} PR number: ${pr} Root path: ${rootPath} Domain: ${domain}`);
  sgAutorelease({repoOwner, repoName, sourceDirectory, pr, githubToken, rootPath, domain});
} else {
  console.log('Usage: surge-github-autorelease -o wix -n wix-style-react -s storybook-dist -b . -p 1455 -t ya65s2sjhd -d wix-wix-style-react');
  console.log('One of the variables is missing, please try again');
}
