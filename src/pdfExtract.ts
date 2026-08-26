export interface PdfExtractionResult {
  rawText: string;
  guessedName: string | null;
  guessedAmount: number | null;
  guessedDueDate: string | null; // YYYY-MM-DD
}

const AMOUNT_LABELS = [
  /amount\s*due/i,
  /total\s*due/i,
  /new\s*charges/i,
  /balance\s*due/i,
];

const DUE_DATE_LABELS = [
  /due\s*date/i,
  /payment\s*due/i,
  /due\s*by/i,
];

const MONEY_PATTERN = /\$\s?[\d,]+\.\d{2}/;
const DATE_PATTERNS = [
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i,
];

export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    text += pageText + "\n";
  }
  return text;
}

function findNear(text: string, labels: RegExp[], valuePattern: RegExp, windowSize = 80): string | null {
  for (const label of labels) {
    const match = label.exec(text);
    if (!match) continue;
    const start = match.index;
    const windowText = text.slice(start, start + match[0].length + windowSize);
    const valueMatch = valuePattern.exec(windowText);
    if (valueMatch) return valueMatch[0];
  }
  return null;
}

function parseMoney(raw: string): number | null {
  const num = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function parseDateGuess(raw: string): string | null {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function extractHeuristics(rawText: string, filename: string): PdfExtractionResult {
  const amountRaw = findNear(rawText, AMOUNT_LABELS, MONEY_PATTERN);
  const amount = amountRaw ? parseMoney(amountRaw) : null;

  let dueDateRaw: string | null = null;
  for (const pattern of DATE_PATTERNS) {
    dueDateRaw = findNear(rawText, DUE_DATE_LABELS, pattern);
    if (dueDateRaw) break;
  }
  const dueDate = dueDateRaw ? parseDateGuess(dueDateRaw) : null;

  const firstLine = rawText.split("\n").map((l) => l.trim()).find((l) => l.length > 2) ?? null;
  const nameFromFile = filename.replace(/\.pdf$/i, "").replace(/[_-]/g, " ").trim();
  const guessedName = firstLine && firstLine.length < 60 ? firstLine : nameFromFile || null;

  return {
    rawText,
    guessedName,
    guessedAmount: amount,
    guessedDueDate: dueDate,
  };
}

export async function extractFromPdf(file: File): Promise<PdfExtractionResult> {
  const rawText = await extractPdfText(file);
  return extractHeuristics(rawText, file.name);
}
