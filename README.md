# npm-publish-action

This GitHub Action publishes NPM packages by running `npm version` and `npm publish`.
It is meant to be leveraged by a composite action or a more elaborate workflow that
defines a more structured process for releasing, such as [npm-publish-from-label-action](https://github.com/infrastructure-blocks/npm-publish-from-label-action).

The action supports the `dry-run` option of `npm publish`. When `dry-run` is true, no packages are published.

This action takes a semantic versioning bump as an input. It can either be "patch", "minor" or
"major".

What it does next depends on if the `prerelease` toggle is enabled or not.

When we are running in release mode (prerelease = false), this action runs `npm version ${{ inputs.version }}`.
This in turn generates a git tag and a commit, and both will be pushed on the remote branch matching the current branch.

When we are running in prerelease mode (prerelease = true), the effective version becomes `pre${version}`.
For example, if the user provides version "patch" and prerelease "true", then the action invokes
`npm version prepatch`. No git tags and commits will be pushed to the branch neither. It is assumed
we are on a development branch, and in order to prevent developers from constantly having to pull changes,
we simply publish the packages.

The second time the action is run on the same branch, the new prepatch version's prerelease number is incremented
instead. We are able to infer a prerelease increment is required because the version in the package.json hasn't changed
and the `prepatch` of the package already exists in the NPM registry.

It is recommended that users provide and `.npmrc` configuration file in their repository.
This `.npmrc` should include a registry configuration, such as `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`. 
Users can also configure options, such as the `preid` of prerelease packages.

The NPM token used to authenticate with NPM to publish the package isn't required because users have several
preexisting ways of setting it. For example, with the above configuration for the registry, the calling code
can simply pass the `NPM_TOKEN` as environment variable. Another alternative is to use 
[@action/setup-node](https://github.com/actions/setup-node) and set the token with
the NODE_AUTH_TOKEN environment variable.

## Usage

We recommend setting up an `.npmrc` file in the project's repository. This is the content we will be using
to represent the usage below:

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
access = public
preid = alpha
```

```yaml
name: Self Test

on: [push]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  npm-publish:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - uses: infrastructure-blocks/npm-publish-action@v1
        id: npm-publish
        env:
          # It is implied that the user has set up an .npmrc file as above.
          NPM_TOKEN: ${{ secrets.YOUR_TOKEN }}
        with:
          version: patch
          prerelease: true
          dry-run: false
      - run: |
          echo "Released version: ${{ join(fromJson(steps.npm-publish.outputs.links), ' ') }}"
```

## Development

This project is written in Typescript and leverages `nvm` to manage its version.

### Setup

Once `nvm` is installed, simply run the following:

```
nvm install
npm install
``` 

### Releasing

The releasing is handled at git level with semantic versioning tags. Those are automatically generated and managed
by the [git-tag-semver-from-label-workflow](https://github.com/infrastructure-blocks/git-tag-semver-from-label-workflow).
