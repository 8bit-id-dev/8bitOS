// Math rendering & input (Dokumen 09 §17): MathText (KaTeX renderer)
// + MathField (input dengan preview live).
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useMemo, useState } from 'react';

// Render LaTeX ke HTML string via KaTeX (throwOnError=false agar
// partial LaTeX tidak crash).
export const renderMath = (latex: string): string => {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
      output: 'html',
    });
  } catch {
    return latex;
  }
};

// MathText: plain text dengan inline $...$ dan block $$...$$ (Dok 09 §17)
export function MathText({ text }: { text: string }) {
  const html = useMemo(() => {
    // block $$...$$ dulu, lalu inline $...$
    const blockSplit = text.split(/\$\$([\s\S]+?)\$\$/g);
    const out = blockSplit
      .map((part, i) => {
        if (i % 2 === 1) {
          return `<span class="block my-2 text-center">${katex.renderToString(part.trim(), {
            throwOnError: false,
            displayMode: true,
          })}</span>`;
        }
        // inline $...$
        return part.replace(/\$([^$\n]+?)\$/g, (_m, tex: string) => renderMath(tex));
      })
      .join('');
    return out;
  }, [text]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

const SNIPPETS: Array<{ label: string; insert: string }> = [
  { label: 'frac', insert: '\\frac{a}{b}' },
  { label: 'x²', insert: 'x^{2}' },
  { label: '√', insert: '\\sqrt{x}' },
  { label: '∫', insert: '\\int' },
  { label: '∑', insert: '\\sum' },
  { label: 'π', insert: '\\pi' },
  { label: '≤', insert: '\\leq' },
  { label: '→', insert: '\\to' },
];

// MathField: Toolbar + Input (LaTeX) + Preview (Dok 09 §17)
export function MathField({
  value,
  onChange,
  label = 'RUMUS (LATEX)',
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [focused, setFocused] = useState(false);
  const preview = useMemo(() => (value.trim() ? renderMath(value) : ''), [value]);

  return (
    <div className="flex flex-col gap-1">
      <span className="micro-pixel text-gray-300">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {SNIPPETS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onChange(`${value}${value && !value.endsWith(' ') ? ' ' : ''}${s.insert}`)}
            className="micro-pixel px-1.5 py-0.5 border border-line-strong text-gray-300 hover:border-fg hover:text-fg"
            aria-label={`Sisipkan ${s.label}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="mis. \frac{-b}{2a}"
        className="bg-bg text-fg border border-line-strong px-3 py-2 font-sans text-small focus-visible:border-fg"
        aria-label="Input LaTeX"
      />
      {(focused || preview) && (
        <div
          className="panel px-3 py-2 min-h-[2.4rem] flex items-center text-fg"
          aria-label="Preview rumus"
          dangerouslySetInnerHTML={{ __html: preview || '<span class="text-gray-500">preview…</span>' }}
        />
      )}
    </div>
  );
}
