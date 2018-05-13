const valueExists = (value): boolean => !!value;
const isValidParams = githubServiceParams => Object.values(githubServiceParams).every(valueExists);

export type UpdateStatusParams = {
  sha: string,
  state: string,
  target_url?: string,
  description?: string,
  context?: string
};

export interface IGithubService {
  isInitialized: () => boolean;
  updateCommitStatus: (UpdateStatusParams) => Promise<any>;
  getPrSha: (number: number) => Promise<string>;
}

export class GithubService implements IGithubService {
  private initialized: boolean = false;

  constructor(private api, private token, private owner, private repo) {
    this.initialized = isValidParams({token, owner, repo});
    if (this.initialized) {
      api.authenticate({
        type: 'oauth',
        token
      });
    }
  }

  isInitialized() {
    return this.initialized;
  }

  updateCommitStatus({sha, state, target_url, description, context}: UpdateStatusParams) {
    const {api, repo, owner} = this;
    return api.repos.createStatus({owner, repo, sha, state, target_url, description, context});
  }

  async getPrSha(number) {
    const {api, repo, owner} = this;
    const response = await api.pullRequests.get({owner, repo, number});
    return response.data.head.sha;
  }
}

export default function createGithubService(api, {token, owner, repo}) {
  return new GithubService(api, token, owner, repo);
}
