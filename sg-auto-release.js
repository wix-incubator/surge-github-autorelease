#!/usr/bin/env node

const {spawn} = require('child_process');
const https = require('https');

async function sgAutorelease({repo, sourceDirectory, pr, githubToken, rootPath, deploySubdomain}) {
  const deployDomain = `https://${deploySubdomain}${pr ? `-pr-${pr}`: ''}.surge.sh`;
  const message = `View storybook at: ${deployDomain}`;
  try {
    await surgeDeploy({sourceDirectory, deployDomain, rootPath});
    if (githubToken && pr) {
      addCommentIfNotExist({repo, pr, githubToken, message})
    }
  } catch (e) {
    console.log('Could not deploy to surge.', e);
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

async function addCommentIfNotExist({repo, pr, githubToken, message}) {
  if (!(await hasCommentWithMessage({repo, pr, githubToken, message}))) {
    gitAddComment({repo, pr, githubToken, message});
  } else {
    console.log('skipping adding comment - already exist');
  }
}

function hasCommentWithMessage({repo, pr, githubToken, message}) {
  const githubCommentsPath = `/repos/${repo}/issues/${pr}/comments`;
  const options = {
    hostname: 'api.github.com',
    method: 'GET',
    path: githubCommentsPath,
    headers: {
      'Authorization': `token ${githubToken}`,
      'User-Agent': 'surge-github-autorelease'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.get(options, res => {
      if (res.statusCode !== 200) {
        console.log('Error while fetching comments', res.statusCode, res.headers);
        reject();
        return;
      }

      let str = '';
      res.on('data', (chunk) => str += chunk);

      res.on('end', () => {
        const arr = JSON.parse(str);
        resolve(arr.map(comment => comment.body).filter((comment) => comment.indexOf(message) > -1).length);
      });
    });

    req.on('error', e => {
      console.log('Error while fetching comments', e);
      reject();
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
    if (res.statusCode === 201) {
      console.log('Commented to github successfully');
    } else {
      console.log('Error while posting the comment', res.statusCode, res.headers)
    }
  });
  req.on('error', e => {
    console.log('Error while posting the comment', e);
  });
  req.end(JSON.stringify(githubCommentsData));
}

module.exports = sgAutorelease;
