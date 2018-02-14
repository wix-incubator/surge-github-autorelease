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

  surgeProcess.stdout.on('data', data => {
    process.stdout.write(d);
  });
  surgeProcess.on('error', e => {
    console.log('Error on surge process', e);
  });
}

function gitAddComment({repo, pr, deployDomain, githubToken}) {
  const githubCommentsPath = `/repos/${repo}/issues/${pr}/comments`;
  const githubCommentsData = {body: `View storybook at: ${deployDomain}`};
  const options = {
    hostname: 'api.github.com',
    path: githubCommentsPath,
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'User-Agent': 'surge-github-autorelease'
    }
  };

  const req = https.request(options, res => {
    if (res.statusCode === 200) {
      console.log('Commented to github successfully');
    }
  });
  req.on('error', e => {
    console.log('Error while posting the comment', e);
  });
  req.end(JSON.stringify(githubCommentsData));
}

module.exports = sgAutorelease;