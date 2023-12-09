# npm-publish-action

This GitHub Action publishes NPM packages by running `npm version` and pushing the result.

## Usage

TO COME

## Development

This project is written in Typescript and leverages `nvm` to manage its version. It also uses Git hooks
to automatically build and commit compiled code. This last part emerges from the fact that GitHub actions
run Javascript (and not typescript) and that all the node_modules/ are expected to be provided in the Git
repository of the action.

Having a Git hook to compile automatically helps in diminishing the chances that a developer forgets to
provide the compiled sources in a change request.

### Setup

Once `nvm` is installed, simply run the following:

```
nvm install
npm install
``` 

### Releasing

The releasing is handled at git level with semantic versioning tags. Those are automatically generated and managed
by the [git-tag-semver-from-label-action](https://github.com/infrastructure-blocks/git-tag-semver-from-label-action).
