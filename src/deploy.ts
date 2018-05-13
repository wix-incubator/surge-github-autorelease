export default async function deploy({rootPath, sourceDirectory, domain, pr, surgeService, fileService, githubService}) {
  const surgeDomain = `https://${domain}${pr ? `-pr-${pr}` : ''}.surge.sh/`;

  const updateStatus = await createStatusUpdater({githubService, pr, domain});
  updateStatus('pending', 'Deploying to surge');

  try {
    const projectPath = `${rootPath}/${sourceDirectory}`;
    if (!fileService.exists(projectPath)) {
      throw(new Error(`${projectPath} does not exist`));
    }
    await surgeService(['publish', '--project', projectPath, '--domain', surgeDomain]);
    updateStatus('success', 'Deployed to surge.sh', surgeDomain);
  } catch (e) {
    updateStatus('error', 'Deployment failed');
    throw e;
  }
}

async function createStatusUpdater({githubService, pr, domain}) {
  if (!githubService.isInitialized() || !pr) {
    return (state, description = null, target_url = null) => { return; };
  }

  const sha = await githubService.getPrSha(pr);
  return (state, description = null, target_url = null) => githubService.updateCommitStatus({
    sha,
    state,
    context: domain,
    ...(description ? {description} : {}),
    ...(target_url ? {target_url} : {})
  });
}
