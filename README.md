# github-action-typescript-docker-template

This is a template repository and several updates should be taken after using it as a repository generator:
- Search & replace the name of the template for the template instance across the repository
- Update package.json fields such as name, description, etc...
- Update action.yml
- Update entrypoint.sh to remap your command's arguments/inputs
- Update the container name in docker-compose.yml
- Update self-test.yml workflow
- Update this README to reflect the new action

## Usage

Describe the action usage here, and provide an example invocation in a GitHub workflow.

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
by the [git-tag-semver-from-label-action](https://github.com/infrastructure-blocks/git-tag-semver-from-label-action).
