export default function createGithubService(api, {token, owner, repo}) {
  api.authenticate({
    type: 'oauth',
    token
  });

  return {
    createPrComment: (number, body) => api.issues.createComment({owner, repo, number, body}),
    getPrComments: async number => (await api.issues.getComments({owner, repo, number})).data
  };
}
