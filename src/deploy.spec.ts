import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import deploy from './deploy';
import * as Chance from 'chance';
import { IGithubService } from './createGithubService';

describe('deploy', () => {
  let rootPath;
  let sourceDirectory;
  let domain;
  let surgeService;
  let sandbox;
  let fileService;
  let githubService: IGithubService;
  let pr;
  let sha;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rootPath = Chance().word();
    sourceDirectory = Chance().word();
    domain = Chance().word();
    sha = Chance().word();
    pr = Chance().natural({ min: 1, max: 20 });
    surgeService = sandbox.spy();
    fileService = {
      exists: sandbox.stub().returns(true),
    };
    githubService = {
      isInitialized: sandbox.stub().returns(Chance().bool()),
      updateCommitStatus: sandbox.spy(),
      getPrSha: sandbox.stub().returns(sha),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  const callDeploy = async () =>
    deploy({
      rootPath,
      sourceDirectory,
      domain,
      pr,
      surgeService,
      fileService,
      githubService,
    });

  const givenInitializedGithubService = isInitialized => {
    githubService.isInitialized = sandbox.stub().returns(isInitialized);
  };

  it('should update the status as pending', async () => {
    givenInitializedGithubService(true);
    await callDeploy();

    expect(githubService.updateCommitStatus).to.be.calledWithExactly({
      sha,
      state: 'pending',
      description: 'Deploying to surge',
      context: domain,
    });
  });

  it('should call surge with the correct static folder and domain', async () => {
    await callDeploy();

    expect(surgeService).to.be.calledOnce.and.to.be.calledWithExactly([
      'publish',
      '--project',
      `${rootPath}/${sourceDirectory}`,
      '--domain',
      `https://${domain}-pr-${pr}.surge.sh/`,
    ]);
  });

  it('should call surge with the correct static folder and domain with no pr', async () => {
    pr = null;
    await callDeploy();

    expect(surgeService).to.be.calledOnce.and.to.be.calledWithExactly([
      'publish',
      '--project',
      `${rootPath}/${sourceDirectory}`,
      '--domain',
      `https://${domain}.surge.sh/`,
    ]);
  });

  it('should update the status as success', async () => {
    givenInitializedGithubService(true);
    await callDeploy();

    expect(githubService.updateCommitStatus).to.be.calledTwice;
    expect(
      (githubService.updateCommitStatus as any).secondCall,
    ).to.be.calledWithExactly({
      sha,
      state: 'success',
      description: 'Deployed to surge.sh',
      target_url: `https://${domain}-pr-${pr}.surge.sh/`,
      context: domain,
    });
  });

  it('should update the status as error', async () => {
    givenInitializedGithubService(true);
    surgeService = sinon.stub().throws();
    try {
      await callDeploy();
    } catch (e) {
      expect(e).to.be.an('Error');
    }

    expect(githubService.updateCommitStatus).to.be.calledTwice;
    expect(
      (githubService.updateCommitStatus as any).secondCall,
    ).to.be.calledWithExactly({
      sha,
      state: 'error',
      description: 'Deployment failed',
      context: domain,
    });
  });

  it('should fail if the folder does not exist', async () => {
    fileService = {
      exists: sandbox.stub().returns(false),
    };

    let error;
    try {
      await callDeploy();
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an('Error');
  });

  it('should not update the commit status', async () => {
    givenInitializedGithubService(false);
    await callDeploy();
    expect(githubService.updateCommitStatus).to.not.be.called;
  });
});
