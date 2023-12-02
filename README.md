# github-action-typescript-template

This is a template repository and several updates should be taken after using it as a repository generator:
- Update this README to reflect the new action
- Update package.json fields such as name, description, etc...
- Update action.yml
- Update entrypoint.sh to remap your command's arguments/inputs
- Update the container name in docker-compose.yml
- Update self-test.yml workflow

## Usage

Describe the action usage here, and provide an example invocation in a GitHub workflow.

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

Once a PR has been approved and merged, the maintainer should create and push a tag on the latest HEAD ref.
The tag should follow [semantic versioning](https://semver.org/). Example:

```shell
git checkout master
git pull
git tag v1.0.3 # patch update
git push --tags
```
