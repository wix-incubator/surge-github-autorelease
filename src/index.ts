const fs = require('fs');
const octokit = require('@octokit/rest')();
const createGithubService = require('./createGithubService').default;
const deploy = require('./deploy').default;
const exec = require('child_process').exec;

const fileService = {
  exists: path => fs.existsSync(path),
};
const surgeService = command =>
  new Promise((resolve, reject) => {
    exec(
      `npx surge ${command.join(' ')}`,
      { timeout: 10000 },
      (error, stdout, stderr) => {
        if (error && error.code !== 0) {
          reject(new Error(`Surge error: ${error} ${error.code} ${stderr}`));
        } else {
          resolve(stdout);
        }
      },
    );
  });

async function sgAutorelease({
  rootPath,
  sourceDirectory,
  domain,
  repoOwner,
  repoName,
  githubToken,
  pr,
}) {
  const githubService = createGithubService(octokit, {
    owner: repoOwner,
    repo: repoName,
    token: githubToken,
  });

  await deploy({
    rootPath,
    sourceDirectory,
    domain,
    pr,
    surgeService,
    fileService,
    githubService,
  });
}

// Not using es6 export to be compatible with importing via require.
// With typescript require().default is needed.
module.exports = sgAutorelease;
