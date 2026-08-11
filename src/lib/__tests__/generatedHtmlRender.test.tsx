import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { sanitizeGeneratedHtml } from "@/lib/htmlSanitizer";

const MALICIOUS = `
  <h2>Best AI Search Tips</h2>
  <p onclick="steal()">Answer first paragraph</p>
  <a href="javascript:alert(document.cookie)">click me</a>
  <a href="https://example.com">safe link</a>
  <img src="x" onerror="alert(1)" alt="broken" />
  <form action="javascript:alert(1)"><button formaction="javascript:alert(2)">go</button></form>
  <video poster="javascript:alert(3)"></video>
  <object data="javascript:alert(4)"></object>
  <script>alert('pwned')</script>
`;

describe("generated HTML rendered via dangerouslySetInnerHTML", () => {
  it("renders no executable URIs, handlers, or scripts", () => {
    const { container } = render(
      <div dangerouslySetInnerHTML={{ __html: sanitizeGeneratedHtml(MALICIOUS) }} />
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("object")).toBeNull();
    expect(container.querySelector("video")).toBeNull();

    container.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        expect(attr.name.toLowerCase().startsWith("on")).toBe(false);
        expect(attr.value.toLowerCase()).not.toContain("javascript:");
        expect(attr.value.toLowerCase()).not.toContain("vbscript:");
      });
    });

    // Safe content survives
    expect(container.querySelector("h2")?.textContent).toBe("Best AI Search Tips");
    expect(container.querySelector('a[href="https://example.com"]')).not.toBeNull();
  });

  it("produces export-safe output identical to the rendered output", () => {
    const exported = sanitizeGeneratedHtml(MALICIOUS);
    const { container } = render(
      <div dangerouslySetInnerHTML={{ __html: exported }} />
    );
    expect(exported.toLowerCase()).not.toContain("javascript:");
    expect(exported.toLowerCase()).not.toContain("<script");
    expect(container.innerHTML.toLowerCase()).not.toContain("javascript:");
  });
});
