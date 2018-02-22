# surge-github-autorelease

This node module will deploy your statics via surge to view your changes easily after pull request, the url of the preview is added to the git comment section.

All you have to do is run `npx surge-github-autorelease` with the appropriate arguments in your release script, for example in your `travis.yml` file `script` section  add: `npx surge-github-autorelease --repo $TRAVIS_REPO_SLUG --root-path $TRAVIS_BUILD_DIR --source-directory $STORYBOOK_DIST --pr $TRAVIS_PULL_REQUEST --github-token $GITHUB_API_TOKEN; --surge-login $SURGE_LOGIN --surge-token $SURGE_TOKEN `

#### `Arguments`

| Argument name            | Description                             | Example            |
| ------------------------ | ---------------------------------------- |------------------ |
| --repo                     | Owner Name/Repo Name  |wix/wix-style-react|
| --root-path                     | Root path to build agent root directory| /home/travis/build/wix/wix-style-react |
| --source-directory                     | static files directory                          | storybook-dist|
| --pr                     | Pull request number                          |1455|
| --github-token                     | Github authentication token                          |ad2jhdjhShi10axK0NENEK0bcnshd|
| --surge-login | Surge email login | wixemail@wixsurge.com |
| --surge-token | Surge token | ajkhaxnbsadsSh1L0 |