// Central i18n configuration + URL helpers.
// Default locale (de) is served unprefixed at the root; en/ar are prefixed.

export const locales = ["de", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

// Human labels for the language switcher.
export const localeLabels: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  ar: "AR",
};

// Text direction per locale.
export const dir = (locale: Locale): "ltr" | "rtl" =>
  locale === "ar" ? "rtl" : "ltr";

// Map a "logical" (German/default) path to its localized URL.
//   localizedPath("/", "en")                         -> "/en/"
//   localizedPath("/leistungen/x/", "ar")            -> "/ar/leistungen/x/"
//   localizedPath("/leistungen/x/", "de")            -> "/leistungen/x/"
export function localizedPath(logicalPath: string, locale: Locale): string {
  const clean = logicalPath.startsWith("/") ? logicalPath : `/${logicalPath}`;
  if (locale === defaultLocale) return clean;
  if (clean === "/") return `/${locale}/`;
  return `/${locale}${clean}`;
}

// hreflang alternates for a localized page (incl. x-default -> German root path).
export function getAlternates(
  logicalPath: string,
): Array<{ hreflang: string; path: string }> {
  const alts = locales.map((l) => ({
    hreflang: l,
    path: localizedPath(logicalPath, l),
  }));
  alts.push({ hreflang: "x-default", path: localizedPath(logicalPath, defaultLocale) });
  return alts;
}

// og:locale values.
export const ogLocale: Record<Locale, string> = {
  de: "de_DE",
  en: "en_US",
  ar: "ar_AE",
};
