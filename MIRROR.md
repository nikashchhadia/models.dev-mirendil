# Mirendil mirror

This repository tracks `anomalyco/models.dev` branch `dev` and publishes **`models-dev-mirendil`**.

## Mirendil delta

Provider models authored with `base_model` retain that canonical ID in generated API/package snapshot records. All inherited upstream fields and provider overrides remain unchanged. Consumers can resolve a provider model to `snapshot.models[providerModel.base_model]`.

## Automated sync and publish

`.github/workflows/mirendil-sync-publish.yml` runs daily and on demand. It merges `upstream/dev`, installs with the lockfile, validates the catalog, runs core and SDK tests, pushes the synchronized `dev` branch, then publishes only when the snapshot differs from npm. Configure the repository Actions secret `NPM_API_KEY`; no token is committed. GitHub Actions requests `id-token: write`, so npm attaches provenance when publishing.

Upstream merge conflicts intentionally stop the workflow for manual resolution rather than overwriting the Mirendil delta.
