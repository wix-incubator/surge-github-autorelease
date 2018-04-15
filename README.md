# surge-github-autorelease

This node module will deploy your statics via surge to view your changes easily after pull request, the url of the preview is added to the git comment section.

All you have to do is run `npx surge-github-autorelease` with the appropriate arguments in your release script, for example in your `package.json` file, in the `release` script add: `npx surge-github-autorelease -r $REPO_SLUG -s $STORYBOOK_DIST -b . -p $PULL_REQUEST -t $GITHUB_API_TOKEN;`

#### `Arguments`

| Argument name            | Description                             | Example            |
| ------------------------ | ---------------------------------------- |------------------ |
| -r                     | Owner Name/Repo Name  |wix/wix-style-react|
| -b                     | Root path to build agent root directory| . |
| -s                     | static files directory                          | storybook-dist|
| -p                     | Pull request number                          |1455|
| -t                     | Github authentication token                          |ad2jhdjhShi10axK0NENEK0bcnshd|

#### Comment Example

![example](https://snag.gy/G5oHd8.jpg)
