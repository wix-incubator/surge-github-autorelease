import 'mocha';
import {expect} from 'chai';
import * as sinon from 'sinon';
import deploy from './deploy';
import * as Chance from 'chance';

describe('deploy', () => {
  let rootPath;
  let sourceDirectory;
  let domain;
  let surgeService;
  let sandbox;
  let fileService;
  let githubService;
  let pr;
  let sha;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rootPath = Chance().word();
    sourceDirectory = Chance().word();
    domain = Chance().word();
    sha = Chance().word();
    pr = Chance().natural({min: 1, max: 20});

    surgeService = sandbox.spy();
    fileService = {
      exists: sandbox.stub().returns(true)
    };
    githubService = {
      createPrComment: sandbox.spy(),
      getPrComments: sandbox.stub().returns([]),
      updateCommitStatus: sandbox.spy(),
      getPrSha: sandbox.stub().returns(sha),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  const callDeploy = async() => await deploy({
    rootPath,
    sourceDirectory,
    domain,
    pr,
    surgeService,
    fileService,
    githubService,
  });

  it('should update the status as pending', async () => {
    await callDeploy();

    expect(githubService.updateCommitStatus)
      .to.be.calledWithExactly({
        sha,
        state: 'pending',
        description: 'Deploying to surge',
        context: domain
      });
  });

  it('should call surge with the correct static folder and domain', async () => {
    await callDeploy();

    expect(surgeService)
      .to.be.calledOnce
      .and.to.be.calledWithExactly(
        ['publish', '--project', `${rootPath}/${sourceDirectory}`, '--domain', `https://${domain}-pr-${pr}.surge.sh/`]
      );
  });

  it('should call surge with the correct static folder and domain with no pr', async () => {
    pr = null;
    await callDeploy();

    expect(surgeService)
      .to.be.calledOnce
      .and.to.be.calledWithExactly(
        ['publish', '--project', `${rootPath}/${sourceDirectory}`, '--domain', `https://${domain}.surge.sh/`]
      );
  });

  it('should update the status as success', async () => {
    await callDeploy();

    expect(githubService.updateCommitStatus).to.be.calledTwice;
    expect(githubService.updateCommitStatus.secondCall)
      .and.to.be.calledWithExactly({
        sha,
        state: 'success',
        description: 'Deployed to surge.sh',
        target_url: `https://${domain}-pr-${pr}.surge.sh/`,
        context: domain
      });
  });

  it('should update the status as error', async () => {
    surgeService = sinon.stub().throws();
    try {
      await callDeploy();
    } catch (e) {
      expect(e).to.be.an('Error');
    }

    expect(githubService.updateCommitStatus).to.be.calledTwice;
    expect(githubService.updateCommitStatus.secondCall)
      .and.to.be.calledWithExactly({
        sha,
        state: 'error',
        description: 'Deployment failed',
        context: domain
      });
  });

  it('should fail if the folder does not exist', async () => {
    fileService = {
      exists: sandbox.stub().returns(false)
    };

    let error;
    try {
      await callDeploy();
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an('Error');
  });

  it('should fail gracefully if github service is null', async () => {
    githubService = null;
    await callDeploy();

    let error;
    try {
      await callDeploy();
    } catch (e) {
      error = e;
    }

    expect(error).to.be.undefined;
 });
});
