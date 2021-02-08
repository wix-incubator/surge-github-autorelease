import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Chance from 'chance';
import createGithubService from './createGithubService';

describe('createGithubService', () => {
  let githubToken;
  let owner;
  let repo;
  let sandbox;
  let githubApi;

  beforeEach(() => {
    githubToken = Chance().word();
    owner = Chance().word();
    repo = Chance().word();
    sandbox = sinon.createSandbox();
    githubApi = {
      authenticate: sandbox.spy(),
      repos: {
        createStatus: sandbox.spy(),
      },
      pullRequests: {
        get: sandbox
          .stub()
          .returns({ data: { head: { sha: Chance().word() } } }),
      },
    };
  });

  afterEach(() => sandbox.restore());

  it('should be initialized', () => {
    const githubService = createGithubService(githubApi, {
      token: githubToken,
      owner,
      repo,
    });
    // eslint-disable-next-line no-unused-expressions
    expect(githubService.isInitialized()).to.be.true;
  });

  it('should be not be initialized if any param is missing', () => {
    const githubServiceParams = { token: githubToken, owner, repo };
    delete githubServiceParams[
      // tslint:disable-next-line: no-dynamic-delete
      Chance().pickone(Object.keys(githubServiceParams))
    ];
    const githubService = createGithubService(githubApi, githubServiceParams);
    // eslint-disable-next-line no-unused-expressions
    expect(githubService.isInitialized()).to.be.false;
  });

  it('should call authenticate when constructed', () => {
    createGithubService(githubApi, { token: githubToken, owner, repo });
    expect(githubApi.authenticate).to.be.calledOnce.and.to.be.calledWithExactly(
      {
        type: 'oauth',
        token: githubToken,
      },
    );
  });

  it('should call repos.createStatus', () => {
    const githubService = createGithubService(githubApi, {
      token: githubToken,
      owner,
      repo,
    });
    const sha = Chance().word();
    const state = Chance().word();
    const target_url = Chance().word();
    const description = Chance().word();
    const context = Chance().word();

    githubService.updateCommitStatus({
      sha,
      state,
      target_url,
      description,
      context,
    });

    expect(
      githubApi.repos.createStatus,
    ).to.be.calledOnce.and.to.be.calledWithExactly({
      owner,
      repo,
      sha,
      state,
      target_url,
      description,
      context,
    });
  });

  it('should call pullRequests.get', () => {
    const githubService = createGithubService(githubApi, {
      token: githubToken,
      owner,
      repo,
    });
    const number = Chance().natural();

    // tslint:disable-next-line: no-floating-promises
    githubService.getPrSha(number);

    expect(
      githubApi.pullRequests.get,
    ).to.be.calledOnce.and.to.be.calledWithExactly({ owner, repo, number });
  });
});
