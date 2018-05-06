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
  .option('-d, --deploy-subdomain [subdomain]', 'Subdomain to deploy to, example: wix-wix-style-react')
  .parse(process.argv);

const {repo, sourceDirectory, pr, githubToken, rootPath, deploySubdomain} = program;
if (repo && sourceDirectory && githubToken && rootPath && deploySubdomain) {
  console.log(`Called with repo: ${repo} sourceDirectory: ${sourceDirectory} PR number: ${pr} Root path: ${rootPath} Deploy subdomain: ${deploySubdomain}`);
  sgAutorelease({repo, sourceDirectory, pr, githubToken, rootPath, deploySubdomain});
} else {
  console.log('Usage: surge-github-autorelease -r wix/wix-style-react -s storybook-dist -b . -p 1455 -t ya65s2sjhd -d wix-wix-style-react');
  console.log('One of the variables is missing, please try again');
}
