import { expect, test } from "bun:test"

test("snapshot exports providers, models, generatedAt, and a default catalog", async () => {
  const snapshot = await import("../src/snapshot.js")
  expect(Object.keys(snapshot.providers).length).toBeGreaterThan(100)
  expect(Object.keys(snapshot.models).length).toBeGreaterThan(100)
  expect(snapshot.default.providers).toBe(snapshot.providers)
  expect(snapshot.default.models).toBe(snapshot.models)
  expect(Number.isNaN(Date.parse(snapshot.generatedAt))).toBe(false)

  const anthropic = snapshot.providers["anthropic"]
  expect(anthropic?.env.length).toBeGreaterThan(0)
  const model = Object.values(anthropic!.models)[0]
  expect(typeof model?.name).toBe("string")
  expect(typeof model?.limit.context).toBe("number")
})


test("snapshot preserves canonical base_model relationships", async () => {
  const snapshot = await import("../src/snapshot.js")
  const mapped = Object.values(snapshot.providers)
    .flatMap((provider: any) => Object.values(provider.models))
    .filter((model: any) => model.base_model !== undefined) as Array<{ base_model: string }>

  expect(mapped.length).toBeGreaterThan(0)
  for (const model of mapped) {
    expect(snapshot.models[model.base_model]).toBeDefined()
  }
})
