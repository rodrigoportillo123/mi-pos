import type { ProductRow } from "../products/types";

export type ParsedItem = {
  product: ProductRow;
  qty: number;
  note?: string;
  confidence: "high" | "low";
  reason?: string;
};

const numberWords: Record<string, number> = {
  un: 1, uno: 1, una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQty(fragment: string): { qty: number; rest: string } {
  const f = normalize(fragment);

  const mNum = f.match(/\b(\d+)\b/);
  if (mNum) {
    const qty = Math.max(1, Number(mNum[1]));
    const rest = f.replace(mNum[0], " ").replace(/\s+/g, " ").trim();
    return { qty, rest };
  }

  for (const [w, n] of Object.entries(numberWords)) {
    const rx = new RegExp(`\\b${w}\\b`, "i");
    if (rx.test(f)) {
      const rest = f.replace(rx, " ").replace(/\s+/g, " ").trim();
      return { qty: n, rest };
    }
  }

  return { qty: 1, rest: f };
}

function findNote(text: string): string | undefined {
  const t = normalize(text);
  const notePatterns = [
    /(sin\s+[a-z0-9\s]+)/,
    /(con\s+poca\s+[a-z0-9\s]+)/,
    /(bien\s+[a-z0-9\s]+)/,
  ];
  for (const p of notePatterns) {
    const m = t.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}

function scoreProductMatch(product: ProductRow, text: string): number {
  const pName = normalize(product.name);
  const t = normalize(text);

  const words = pName.split(" ").filter(w => w.length >= 3);
  let score = 0;
  for (const w of words) {
    if (t.includes(w)) score += 2;
  }
  if (t.includes(pName)) score += 4;

  return score;
}

export function parseVoiceOrder(transcriptRaw: string, products: ProductRow[]): {
  normalized: string;
  items: ParsedItem[];
  needsConfirmation: boolean;
  message?: string;
} {
  const transcript = normalize(transcriptRaw);

  const parts = transcript
    .replace(":", " ")
    .split(/,|\by\b|\be\b/)
    .map(p => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return {
      normalized: transcript,
      items: [],
      needsConfirmation: true,
      message: "No entendí el pedido. Intenta decir producto y cantidad."
    };
  }

  const activeProducts = products.filter(p => p.is_active);
  const parsed: ParsedItem[] = [];

  for (const part of parts) {
    const { qty, rest } = extractQty(part);
    const note = findNote(part);

    const scored = activeProducts
      .map(p => ({ p, score: scoreProductMatch(p, rest) }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    const second = scored[1];

    if (!best || best.score < 2) {
      return {
        normalized: transcript,
        items: parsed,
        needsConfirmation: true,
        message: `No pude identificar un producto en: "${part}".`
      };
    }

    const ambiguous = second && best.score - second.score <= 1;

    parsed.push({
      product: best.p,
      qty,
      note,
      confidence: ambiguous ? "low" : "high",
      reason: ambiguous ? `Podría ser "${best.p.name}" o "${second.p.name}".` : undefined,
    });
  }

  const needsConfirmation = parsed.some(i => i.confidence === "low");
  return {
    normalized: transcript,
    items: parsed,
    needsConfirmation,
    message: needsConfirmation ? "Confirmación requerida: hay productos ambiguos." : undefined,
  };
}