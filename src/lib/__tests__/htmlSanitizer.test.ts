import { describe, it, expect } from "vitest";
import {
  sanitizeGeneratedHtml,
  sanitizeToPlainText,
  isSafeUrl,
  SANITIZER_URI_ATTRIBUTES,
} from "@/lib/htmlSanitizer";

const contains = (html: string, needle: string) =>
  html.toLowerCase().includes(needle.toLowerCase());

describe("sanitizeGeneratedHtml - script & event handlers", () => {
  it("removes script tags and their content", () => {
    const out = sanitizeGeneratedHtml(
      '<p>Hello</p><script>alert("xss")</script>'
    );
    expect(out).toBe("<p>Hello</p>");
  });

  it("removes inline event handlers", () => {
    const out = sanitizeGeneratedHtml(
      '<div onclick="alert(1)" onmouseover=alert(2)>text</div>'
    );
    expect(contains(out, "onclick")).toBe(false);
    expect(contains(out, "onmouseover")).toBe(false);
    expect(out).toContain("text");
  });

  it("removes style and iframe tags", () => {
    const out = sanitizeGeneratedHtml(
      '<style>body{}</style><iframe src="https://evil.test"></iframe><p>ok</p>'
    );
    expect(contains(out, "<style")).toBe(false);
    expect(contains(out, "<iframe")).toBe(false);
    expect(out).toContain("<p>ok</p>");
  });
});

describe("sanitizeGeneratedHtml - javascript: URIs", () => {
  const payloads = [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'jav\u0000ascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  ];

  it.each(payloads)("strips %s from href", (payload) => {
    const out = sanitizeGeneratedHtml(`<a href="${payload}">click</a>`);
    expect(contains(out, "javascript")).toBe(false);
    expect(contains(out, "vbscript")).toBe(false);
    expect(contains(out, "data:text/html")).toBe(false);
    expect(out).toContain("click");
  });

  it.each(SANITIZER_URI_ATTRIBUTES)(
    "strips javascript: from the %s attribute",
    (attr) => {
      const out = sanitizeGeneratedHtml(
        `<a ${attr}="javascript:alert(1)">x</a>` +
          `<img ${attr}="javascript:alert(1)" alt="x" />` +
          `<div ${attr}="javascript:alert(1)">y</div>`
      );
      expect(contains(out, "javascript:")).toBe(false);
    }
  );

  it("strips javascript: from form action and formaction", () => {
    const out = sanitizeGeneratedHtml(
      '<form action="javascript:alert(1)"><button formaction="javascript:alert(2)">go</button></form>'
    );
    expect(contains(out, "javascript:")).toBe(false);
    expect(contains(out, "<form")).toBe(false);
  });

  it("strips javascript: from object data, video poster and body background", () => {
    const out = sanitizeGeneratedHtml(
      '<object data="javascript:alert(1)"></object>' +
        '<video poster="javascript:alert(2)"></video>' +
        '<table background="javascript:alert(3)"><tr><td>c</td></tr></table>'
    );
    expect(contains(out, "javascript:")).toBe(false);
    expect(contains(out, "background=")).toBe(false);
  });

  it("rejects protocol-relative URLs", () => {
    const out = sanitizeGeneratedHtml('<a href="//evil.test/steal">x</a>');
    expect(contains(out, "//evil.test")).toBe(false);
  });
});

describe("sanitizeGeneratedHtml - safe content preserved", () => {
  it("keeps http/https/mailto links and adds rel for new tabs", () => {
    const out = sanitizeGeneratedHtml(
      '<a href="https://example.com" target="_blank">site</a>' +
        '<a href="mailto:hi@example.com">mail</a>' +
        '<a href="/relative">rel</a>'
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('href="mailto:hi@example.com"');
    expect(out).toContain('href="/relative"');
  });

  it("keeps typical generated article markup", () => {
    const html =
      '<h2>Answer</h2><p>Some <strong>bold</strong> text</p>' +
      '<ul><li>one</li></ul><img src="https://cdn.example.com/a.png" alt="a" />' +
      '<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>d</td></tr></tbody></table>';
    expect(sanitizeGeneratedHtml(html)).toBe(html);
  });

  it("handles non-string and empty input", () => {
    expect(sanitizeGeneratedHtml(undefined)).toBe("");
    expect(sanitizeGeneratedHtml(null)).toBe("");
    expect(sanitizeGeneratedHtml(123 as unknown as string)).toBe("");
    expect(sanitizeGeneratedHtml("")).toBe("");
  });
});

describe("sanitizeToPlainText", () => {
  it("strips all markup for markdown/plain exports", () => {
    const out = sanitizeToPlainText('<p>Hi</p><script>alert(1)</script><b>there</b>');
    expect(contains(out, "<")).toBe(false);
    expect(out).toContain("Hi");
    expect(out).toContain("there");
  });
});

describe("isSafeUrl", () => {
  it.each([
    "https://example.com",
    "http://example.com/path?q=1",
    "mailto:a@b.com",
    "/relative/path",
    "images/a.png",
  ])("accepts %s", (url) => {
    expect(isSafeUrl(url)).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "java\tscript:alert(1)",
    "vbscript:x",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "//evil.test",
    "",
    undefined,
  ])("rejects %s", (url) => {
    expect(isSafeUrl(url as string)).toBe(false);
  });
});
