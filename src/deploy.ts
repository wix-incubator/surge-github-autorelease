import {resolve} from 'path';

export default async function deploy({rootPath, sourceDirectory, domain, pr, surgeService, fileService, githubService}) {
  const projectPath = `${rootPath}/${sourceDirectory}`;
  if (!fileService.exists(projectPath)) {
    throw(new Error(`${projectPath} does not exist`));
  }

  const surgeDomain = `https://${domain}${pr ? `-pr-${pr}` : ''}.surge.sh/`;
  await surgeService(['publish', '--project', projectPath, '--domain', surgeDomain]);
  if (githubService && pr) {
    await updatePr({githubService, pr, surgeDomain});
  }
}

async function updatePr({githubService, pr, surgeDomain}) {
  const message = `View storybook at: ${surgeDomain}`;

  const comments = await githubService.getPrComments(pr);
  const commentWithMessage = comment => comment.body.includes(message);
  if (!comments.find(commentWithMessage)) {
    githubService.createPrComment(pr, message);
  }
}
