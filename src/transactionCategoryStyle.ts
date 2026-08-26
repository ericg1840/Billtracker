// Fixed hues for the categories seen in card exports, so colors stay stable
// across imports rather than shifting when new categories appear. Anything
// unrecognized falls back to a deterministic hash-based hue.
const FIXED_HUES: Record<string, number> = {
  restaurants: 40,
  gas: 85,
  grocery: 152,
  shopping: 300,
  entertainment: 350,
  medical: 215,
  alcohol: 25,
  tolls: 260,
  other: 280,
};

function hashHue(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) % 360;
  }
  return hash;
}

export function txCategoryColor(category: string): string {
  const key = category.trim().toLowerCase();
  const hue = FIXED_HUES[key] ?? hashHue(key);
  return `oklch(66% 0.15 ${hue})`;
}
