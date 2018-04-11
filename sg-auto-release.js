const {spawn} = require('child_process');
const https = require('https');

async function sgAutorelease({repo, sourceDirectory, pr, githubToken, rootPath}) {
  const [repoOwner, repoName] = repo.split('/');
  const deployDomain = pr ? `https://${repoOwner}-${repoName}-pr-${pr}.surge.sh` : `https://${repoOwner}-${repoName}-commit.surge.sh`;
  const message = `View storybook at: ${deployDomain}`;
  try {
    await surgeDeploy({sourceDirectory, deployDomain, rootPath});
    if (githubToken && pr) {
      gitAddComment({repo, pr, githubToken, message})
    };
  } catch (e) {
    console.log('Could not deploy to surge.');
  }
}

function surgeDeploy({sourceDirectory, deployDomain, rootPath}) {
  return new Promise((resolve, reject) => {
    const deployPath = `${rootPath}/${sourceDirectory}`;
    console.log(`Deploying to Surge from: ${deployPath}...`);
    const surgeProcess = spawn('npx', ['surge', '--project', deployPath, '--domain', deployDomain]);
    const msg = {
      stdout: '',
      stderr: ''
    };

    surgeProcess.stdout.on('data', data => {
      msg.stdout += data.toString();
    });

    surgeProcess.stderr.on('data', data => {
      msg.stderr += data.toString();
    });

    surgeProcess.on('error', e => {
      console.log('Error on surge process', e);
      reject();
    });

    surgeProcess.on('close', () => {
      console.log('Surge process has finished.');
      if (msg.stdout) {
        console.log(`Surge process stdout: ${msg.stdout}`);
        resolve();
      }
      if (msg.stderr) {
        console.log(`Surge process stderr: ${msg.stderr}`);
      }
    });
  });

}


function gitAddComment({repo, pr, githubToken, message}) {
  const githubCommentsPath = `/repos/${repo}/issues/${pr}/comments`;
  const githubCommentsData = {body: message};
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
