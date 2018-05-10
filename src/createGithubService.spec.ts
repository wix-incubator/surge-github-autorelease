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
  const pr = Chance().word();
  const sandbox = sinon.createSandbox();
  const githubApi  = {
    authenticate: sandbox.spy(),
    issues: {
      createComment: sandbox.spy(),
      getComments: sandbox.spy()
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

  it('should call createComment', () => {
    const githubService = createGithubService(githubApi, {token: githubToken, owner, repo});
    const body = Chance().sentence();

    githubService.createPrComment(pr, body);

    expect(githubApi.issues.createComment).to.be.calledOnce
      .and.to.be.calledWithExactly({owner, repo, number: pr, body});
  });

  it('should call getComments', () => {
    const githubService = createGithubService(githubApi, {token: githubToken, owner, repo});
    const body = Chance().sentence();

    githubService.getPrComments(pr);

    expect(githubApi.issues.getComments).to.be.calledOnce
      .and.to.be.calledWithExactly({owner, repo, number: pr});
  });
});
