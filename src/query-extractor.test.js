import { describe, it, expect } from "vitest";
import { extractQuery } from "./query-extractor.js";

describe("extractQuery", () => {
  it("extracts q from google.com", () => {
    expect(extractQuery("https://www.google.com/search?q=hello+world")).toBe("hello world");
  });

  it("extracts q from google.dk", () => {
    expect(extractQuery("https://www.google.dk/search?q=danish+pastry")).toBe("danish pastry");
  });

  it("extracts q from google.co.uk", () => {
    expect(extractQuery("https://www.google.co.uk/search?q=fish+chips")).toBe("fish chips");
  });

  it("handles URL-encoded queries", () => {
    expect(extractQuery("https://www.google.com/search?q=caf%C3%A9%20latte")).toBe("café latte");
  });

  it("rejects Google images (tbm=isch)", () => {
    expect(extractQuery("https://www.google.com/search?q=cats&tbm=isch")).toBeNull();
  });

  it("rejects Google shopping (tbm=shop)", () => {
    expect(extractQuery("https://www.google.com/search?q=shoes&tbm=shop")).toBeNull();
  });

  it("rejects Google news (tbm=nws)", () => {
    expect(extractQuery("https://www.google.com/search?q=news&tbm=nws")).toBeNull();
  });

  it("rejects Google maps URLs", () => {
    expect(extractQuery("https://www.google.com/maps?q=pizza")).toBeNull();
  });

  it("rejects udm verticals other than web", () => {
    expect(extractQuery("https://www.google.com/search?q=test&udm=2")).toBeNull();
  });

  it("allows udm=14 (web)", () => {
    expect(extractQuery("https://www.google.com/search?q=test&udm=14")).toBe("test");
  });

  it("rejects non-Google URLs", () => {
    expect(extractQuery("https://www.bing.com/search?q=hello")).toBeNull();
  });

  it("rejects Google URLs without q param", () => {
    expect(extractQuery("https://www.google.com/search")).toBeNull();
  });

  it("returns null for invalid URLs", () => {
    expect(extractQuery("not-a-url")).toBeNull();
  });
});
