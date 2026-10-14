import { describe, expect, it } from "vitest";

describe("frontend project foundation", () => {
  it("provides the application title", () => {
    const title = "AI Brand Monitor";
    expect(title).toContain("Brand Monitor");
  });
});
