import 'mocha';
import {expect, use} from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as Chance from 'chance';
import createGithubService from './createGithubService';

use(sinonChai);
describe('createGithubService', () => {
  const githubToken = Chance().word();
  const owner = Chance().word();
  const repo = Chance().word();
  const sandbox = sinon.createSandbox();
  const githubApi  = {
    authenticate: sandbox.spy(),
    repos: {
      createStatus: sandbox.spy()
    },
    pullRequests: {
      get: sandbox.spy()
    }
  };

  afterEach(() => sandbox.restore());

  it('should call authenticate when constructed', () => {
    createGithubService(githubApi, {token: githubToken, owner, repo});
    expect(githubApi.authenticate).to.be.calledOnce.and.to.be.calledWithExactly({
      type: 'oauth',
      token: githubToken
    });
  });

  it('should call createStatus', () => {
    const githubService = createGithubService(githubApi, {token: githubToken, owner, repo});
    const sha = Chance().word();
    const state = Chance().word();
    const target_url = Chance().word();
    const description = Chance().word();
    const context = Chance().word();

    githubService.updateCommitStatus({sha, state, target_url, description, context});

    expect(githubApi.repos.createStatus).to.be.calledOnce
      .and.to.be.calledWithExactly({owner, repo, sha, state, target_url, description, context});
  });

  it('should call createStatus', () => {
    const githubService = createGithubService(githubApi, {token: githubToken, owner, repo});
    const number = Chance().natural();

    githubService.getPrSha(number);

    expect(githubApi.pullRequests.get).to.be.calledOnce
      .and.to.be.calledWithExactly({owner, repo, number});
  });
});
