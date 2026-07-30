import { describe, expect, it } from 'vitest';
import { escapeHtml, escapeHtmlWithLineBreaks } from '../utils/escapeHtml';

describe('escapeHtml', () => {
  it('escapes the characters that break out of HTML text and attributes', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('escapes ampersands before other entities so escaping is not doubled', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('neutralizes a phishing link injected into an email body', () => {
    const injected = '<a href="https://evil.example">Verify your account</a>';

    expect(escapeHtml(injected)).not.toMatch(/<a /);
    expect(escapeHtml(injected)).toContain('&lt;a href=&quot;');
  });

  it('neutralizes an attribute break-out via the mailto href', () => {
    const injected = 'x@y.com" onmouseover="steal()';

    expect(escapeHtml(injected)).not.toContain('"');
    expect(escapeHtml(injected)).toContain('&quot;');
  });

  it('leaves ordinary text untouched', () => {
    expect(escapeHtml('Anna Smith')).toBe('Anna Smith');
  });
});

describe('escapeHtmlWithLineBreaks', () => {
  it('converts newlines to <br> after escaping, so the tags survive', () => {
    expect(escapeHtmlWithLineBreaks('one\ntwo')).toBe('one<br>two');
  });

  it('still escapes markup while converting newlines', () => {
    expect(escapeHtmlWithLineBreaks('<b>hi</b>\nthere')).toBe(
      '&lt;b&gt;hi&lt;/b&gt;<br>there'
    );
  });

  it('does not let an injected literal br tag through unescaped', () => {
    expect(escapeHtmlWithLineBreaks('a<br>b')).toBe('a&lt;br&gt;b');
  });
});
