const {spawn} = require('child_process');
const https = require('https');

function sgAutorelease({repo, sourceDirectory, pr, githubToken}) {
  console.log(repo);
  const [repoOwner, repoName] = (repo.split('/'));
  const deployDomain = `https://${repoOwner}-${repoName}-pr-${pr}.surge.sh`;
  surgeDeploy({repo, sourceDirectory, deployDomain, repoOwner, repoName});
  gitAddComment({repo, pr, deployDomain, githubToken});
}

function surgeDeploy({sourceDirectory, deployDomain, repoOwner, repoName}) {
  const deployPath = `/home/travis/build/${repoOwner}/${repoName}/${sourceDirectory}`;
  const surgeProcess = spawn('node', [`${process.cwd()}/node_modules/.bin/surge`, '--project', deployPath, '--domain', deployDomain]);
  let surgeResults = '';

  surgeProcess.stdout.on('data', data => {
    surgeResults += data;
  });
  surgeProcess.on('error', e => {
    console.log('Error on surge process', e);
  });
  surgeProcess.on('close', () => {
    console.log(surgeResults);
  });
}

function gitAddComment({repo, pr, deployDomain, githubToken}) {
  const githubCommentsPath = `/repos/${repo}/issues/${pr}/comments`;
  const githubCommentsData = {body: `View storybook at: ${deployDomain}`};
  const options = {
    hostname: 'api.github.com',
    path: githubCommentsPath,
    port: 443,
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'User-Agent': 'surge-github-autorelease'
    }
  };

  const req = https.request(options, res => {
    res.on('data', d => {
      process.stdout.write(d);
    });
  });
  req.on('error', e => {
    console.log('Error while posting the comment', e);
  });
  req.write(JSON.stringify(githubCommentsData));
  req.end();
}

module.exports = sgAutorelease;