# models-dev-mirendil

Mirendil-maintained typed client and snapshot based on [Models.dev](https://models.dev). Unlike the upstream package, provider model records preserve the authored `base_model` canonical relationship.

```sh
npm install models-dev-mirendil
```

## Usage

```ts
import { Models } from "models-dev-mirendil"

const client = Models.make()

const providers = await client.providers() // GET /api.json
providers["anthropic"]?.models["claude-opus-4-6"]?.cost?.input // USD per 1M tokens

const models = await client.models() // GET /models.json
models["anthropic/claude-opus-4-6"]?.knowledge // provider-agnostic metadata

const catalog = await client.catalog() // GET /catalog.json — both in one request
```

Options:

```ts
const client = Models.make({
  baseUrl: "https://models.dev", // default
  fetch: myFetch,                // proxies, polyfills, test doubles
  headers: { "x-extra": "1" },   // sent with every request
})

await client.providers({ signal: AbortSignal.timeout(5000) })
```

Errors are a single `ModelsDevError` with `reason: "Transport" | "UnexpectedStatus" | "MalformedResponse"` and the underlying `cause`.

### Snapshot

A full copy of the database ships inside the package as a separate, tree-shakable entrypoint:

```ts
import snapshot, { providers, models, generatedAt } from "models-dev-mirendil/snapshot"

providers["anthropic"]?.models["claude-opus-4-6"]?.limit.context

// Provider records authored with base_model retain their canonical ID.
providers["openrouter"]?.models["anthropic/claude-opus-4-6"]?.base_model
```

`base_model` is optional because upstream data only declares it for provider records that explicitly inherit canonical metadata. Its value is a key in the snapshot's `models` map.

Use it for no-network runtimes, tests, cold-start-sensitive paths, or as an explicit fallback:

```ts
const providers = await client.providers().catch(async () => (await import("models-dev-mirendil/snapshot")).providers)
```

The published snapshot is at most ~24h behind the live API (data releases are automated).

### Effect

An Effect-native client lives at `@opencode-ai/models/effect` (requires the optional peer dependency `effect`):

```ts
import { Models } from "models-dev-mirendil/effect"
import { FetchHttpClient } from "effect/unstable/http"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const client = yield* Models.make()
  return yield* client.providers() // Effect<ProviderMap, ModelsDevError>
})

await program.pipe(Effect.provide(FetchHttpClient.layer), Effect.runPromise)
```

Transport comes from the environment's `HttpClient` service, so proxies, retries, tracing, and test transports compose the usual Effect way. For DI, `Models.Service` and `Models.layer(options?)` are provided:

```ts
const program = Effect.gen(function* () {
  const client = yield* Models.Service
  return yield* client.models()
})

program.pipe(Effect.provide(Models.layer().pipe(Layer.provide(FetchHttpClient.layer))))
```
