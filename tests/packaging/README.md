# Published package compatibility

Run `pnpm build` followed by `pnpm test:packaging`. The test installs the two candidate
archives and the published baselines in temporary, standalone consumers. It checks
export paths and TypeScript declarations, exercises the packaged validators, events
and bundled API specs, and builds a production Angular consumer at the current and
minimum declared peer versions.

`published-api.json` records the versions used as compatibility references. After a
release is available in GitHub Packages, update the corresponding pin to that
published version. The suite uses ordinary registry read authentication.

`accepted-changes.json` lists the declaration changes against those references that a
pull request makes on purpose, each with its reason, as the test reports them. Only an
intended change that consumers can take with a minor release belongs there. The test
fails on an accepted change that no longer occurs, so empty the list when a pin moves to
the release that carries the changes.
