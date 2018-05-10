export default function createGithubService(api, {token, owner, repo}) {
  api.authenticate({
    type: 'oauth',
    token
  });

  return {
    updateCommitStatus: async ({sha, state, target_url, description, context}) =>
      api.repos.createStatus({owner, repo, sha, state, target_url, description, context}),
    getPrSha: async number => (await api.pullRequests.get({owner, repo, number})).data.head.sha,
  };
}
