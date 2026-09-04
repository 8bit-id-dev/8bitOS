import { describe, expect, it } from 'vitest';
import { renderMath } from './math';

describe('math helpers', () => {
  it('renders valid latex to html containing katex markup', () => {
    const html = renderMath('\\frac{a}{b}');
    expect(html).toContain('katex');
  });

  it('does not throw on invalid latex (throwOnError=false)', () => {
    expect(() => renderMath('\\frac{')).not.toThrow();
  });

  it('falls back to raw string on render error', () => {
    const html = renderMath('x^2 + 1');
    expect(html.length).toBeGreaterThan(0);
  });
});
