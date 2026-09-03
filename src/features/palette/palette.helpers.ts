// Command palette fuzzy matching + ranking (Dokumen 07 §28-29, Dokumen 08 §23)
export interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  keywords?: string;
  to?: string;
  action?: () => void;
}

// Token-prefix fuzzy score: higher = better match; 0 = no match.
// Matches label (primary) and keywords (secondary, lower weight).
export const fuzzyScore = (query: string, text: string): number => {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 1; // empty query: everything matches neutrally
  if (t.startsWith(q)) return 100 - Math.min(50, t.length - q.length);
  const idx = t.indexOf(q);
  if (idx >= 0) return 60 - Math.min(30, idx);
  // subsequence fallback: all query chars in order
  let ti = 0;
  let hits = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return 0;
    ti = found + 1;
    hits += 1;
  }
  return Math.max(1, 20 - (t.length - hits));
};

export const rankItems = <T extends PaletteItem>(
  query: string,
  items: T[],
  limit = 8,
): T[] => {
  if (!query.trim()) return items.slice(0, limit);
  const scored = items
    .map((item) => ({
      item,
      score: Math.max(
        fuzzyScore(query, item.label),
        item.keywords ? fuzzyScore(query, item.keywords) * 0.8 : 0,
        fuzzyScore(query, item.group) * 0.5,
      ),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
};
