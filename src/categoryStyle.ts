import { Zap, Droplet, Wifi, Flame, Tag, type LucideIcon } from "lucide-react";

export interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  soft: string;
}

// Color values are literal (not CSS var()) because these feed SVG fill/stroke
// presentation attributes (Recharts Cell, lucide icons), which don't reliably
// resolve custom properties in every browser. Keep in sync with app.css.
const STYLES: Record<string, CategoryStyle> = {
  electric: { icon: Zap, color: "oklch(72% 0.15 85)", soft: "var(--electric-soft)" },
  gas: { icon: Flame, color: "oklch(66% 0.17 40)", soft: "var(--gas-soft)" },
  water: { icon: Droplet, color: "oklch(68% 0.15 215)", soft: "var(--water-soft)" },
  internet: { icon: Wifi, color: "oklch(64% 0.19 300)", soft: "var(--internet-soft)" },
};

const DEFAULT_STYLE: CategoryStyle = { icon: Tag, color: "oklch(58% 0.02 280)", soft: "var(--other-soft)" };

export function getCategoryStyle(category: string): CategoryStyle {
  return STYLES[category.trim().toLowerCase()] ?? DEFAULT_STYLE;
}
