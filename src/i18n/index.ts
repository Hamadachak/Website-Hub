import de from "./de";
import en from "./en";
import ar from "./ar";
import type { Locale } from "./config";
import type { Dict } from "./de";

const dicts: Record<Locale, Dict> = { de, en, ar };

export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? de;
}

export * from "./config";
export type { Dict };
