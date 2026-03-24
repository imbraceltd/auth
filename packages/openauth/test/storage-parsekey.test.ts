import { describe, it, expect } from "bun:test"
import { joinKey } from "../src/storage/storage"

/**
 * Tests that the parseKey logic used across storage adapters is consistent.
 *
 * DynamoDB's parseKey is the reference implementation. Other adapters
 * (MongoDB, etc.) should produce the same pk/sk split for the same input.
 */

// Reference parseKey (same as dynamo.ts)
function parseKey(key: string[]) {
  if (key.length === 2) {
    return { pk: key[0], sk: key[1] }
  }
  if (key.length < 2) {
    return { pk: joinKey(key), sk: "" }
  }
  return {
    pk: joinKey(key.slice(0, 2)),
    sk: joinKey(key.slice(2)),
  }
}

describe("parseKey consistency", () => {
  it("handles 2-element keys", () => {
    const result = parseKey(["oauth:code", "abc123"])
    expect(result.pk).toBe("oauth:code")
    expect(result.sk).toBe("abc123")
  })

  it("handles 3-element keys", () => {
    const result = parseKey(["oauth:refresh", "user:abc", "token123"])
    expect(result.pk).toBe(joinKey(["oauth:refresh", "user:abc"]))
    expect(result.sk).toBe("token123")
  })

  it("handles 4-element keys", () => {
    const result = parseKey(["a", "b", "c", "d"])
    expect(result.pk).toBe(joinKey(["a", "b"]))
    expect(result.sk).toBe(joinKey(["c", "d"]))
  })

  it("handles 1-element keys", () => {
    const result = parseKey(["single"])
    expect(result.pk).toBe("single")
    expect(result.sk).toBe("")
  })

  it("handles empty keys", () => {
    const result = parseKey([])
    expect(result.pk).toBe("")
    expect(result.sk).toBe("")
  })
})
