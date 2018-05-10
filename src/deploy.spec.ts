import 'mocha';
import {expect, use} from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import deploy from './deploy';
import * as Chance from 'chance';

use(sinonChai);

describe('deploy', () => {
  let rootPath;
  let sourceDirectory;
  let domain;
  let surgeService;
  let sandbox;
  let fileService;
  let githubService;
  let pr;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rootPath = Chance().word();
    sourceDirectory = Chance().word();
    domain = Chance().word();
    surgeService = sandbox.spy();
    fileService = {
      exists: sandbox.stub().returns(true)
    };
    githubService = {
      createPrComment: sandbox.spy(),
      getPrComments: sandbox.stub().returns([])
    };
    pr = Chance().natural({min: 1, max: 20});
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

  it('should add a github comment for the correct pr', async () => {
    await callDeploy();

    expect(githubService.createPrComment).to.be.calledOnce
      .and.to.be.calledWithExactly(pr,
        `View storybook at: https://${domain}-pr-${pr}.surge.sh/`
      );
  });

  it('should not add a github comment if the comment already exists', async () => {
    githubService.getPrComments = sandbox.stub()
      .withArgs(pr)
      .returns([{
        body: `View storybook at: https://${domain}-pr-${pr}.surge.sh/`
      }]);

    await callDeploy();

    expect(githubService.createPrComment).to.not.be.called;
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

 it('should not create a pr if pr is not defined', async () => {
   pr = null;
   await callDeploy();

   expect(githubService.createPrComment).to.not.be.called;
 });
});
