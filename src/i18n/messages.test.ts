import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import pt from "../../messages/pt.json";

function leafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("messages", () => {
  it("en and pt expose the same set of translation keys", () => {
    expect(leafPaths(pt).sort()).toEqual(leafPaths(en).sort());
  });
});
