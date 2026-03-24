import { describe, it, expect } from "bun:test"
import { validateIdentifier } from "../src/storage/validate"

describe("validateIdentifier", () => {
  it("accepts valid table names", () => {
    expect(validateIdentifier("openauth_storage")).toBe("openauth_storage")
    expect(validateIdentifier("my_table")).toBe("my_table")
    expect(validateIdentifier("_private")).toBe("_private")
    expect(validateIdentifier("Table1")).toBe("Table1")
    expect(validateIdentifier("a")).toBe("a")
  })

  it("rejects names starting with a digit", () => {
    expect(() => validateIdentifier("1table")).toThrow("invalid")
  })

  it("rejects names with special characters", () => {
    expect(() => validateIdentifier("my-table")).toThrow("invalid")
    expect(() => validateIdentifier("my.table")).toThrow("invalid")
    expect(() => validateIdentifier("my table")).toThrow("invalid")
    expect(() => validateIdentifier("my;table")).toThrow("invalid")
  })

  it("rejects SQL injection attempts", () => {
    expect(() => validateIdentifier("t; DROP TABLE users;--")).toThrow(
      "invalid",
    )
    expect(() => validateIdentifier("t' OR '1'='1")).toThrow("invalid")
    expect(() => validateIdentifier("$(whoami)")).toThrow("invalid")
  })

  it("rejects empty string", () => {
    expect(() => validateIdentifier("")).toThrow("invalid")
  })

  it("rejects names longer than 63 characters", () => {
    const longName = "a".repeat(64)
    expect(() => validateIdentifier(longName)).toThrow("invalid")
    // 63 chars is OK
    expect(validateIdentifier("a".repeat(63))).toBe("a".repeat(63))
  })

  it("uses custom label in error message", () => {
    expect(() => validateIdentifier("bad-name", "Index name")).toThrow(
      "Index name",
    )
  })
})
