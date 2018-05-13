#!/usr/bin/env node

const program = require('commander');
const packageJson = require('../../package.json');
const sgAutorelease = require('./index');

program
  .version(packageJson.version)
  .option('-s, --source-directory [type]', 'static files directory')
  .option('-b, --root-path [type]', 'Root path to build agent root directory')
  .option('-d, --domain [domain]', 'Domain to deploy to, example: wix-wix-style-react')
  .option('-o, --repo-owner [type]', 'Repo Owner Name example: wix (optional)')
  .option('-n, --repo-name [type]', 'Repo Name example: wix-style-react (optional)')
  .option('-p, --pr [type]', 'Pull request number (optional)')
  .option('-t, --github-token [type]', 'Github authentication token (optional)')
  .parse(process.argv);

const {repoOwner, repoName, sourceDirectory, pr, githubToken, rootPath, domain} = program;
if (sourceDirectory && rootPath && domain) {
  console.log(`Called with repoOwner: ${repoOwner} repoName: ${repoName} sourceDirectory: ${sourceDirectory} PR number: ${pr} Root path: ${rootPath} Domain: ${domain}`);
  sgAutorelease({repoOwner, repoName, sourceDirectory, pr, githubToken, rootPath, domain});
} else {
  console.log('Usage: surge-github-autorelease -o wix -n wix-style-react -s storybook-dist -b . -p 1455 -t ya65s2sjhd -d wix-wix-style-react');
  console.log('One of the variables is missing, please try again');
}

export default null;
