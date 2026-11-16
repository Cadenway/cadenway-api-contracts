# Published package compatibility

Run `pnpm build` followed by `pnpm test:packaging`. The test installs the two candidate
archives and the published baselines in temporary, standalone consumers. It checks
export paths and TypeScript declarations, exercises the packaged validators, events
and bundled API specs, and builds a production Angular consumer at the current and
minimum declared peer versions.

`published-api.json` records the versions used as compatibility references. After a
release is available in GitHub Packages, update the corresponding pin to that
published version. The suite uses ordinary registry read authentication.
