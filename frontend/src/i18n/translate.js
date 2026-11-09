import bnTranslations from './bn.json';
import enTranslations from './en.json';

const isDev = Boolean(
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ||
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production')
);

/**
 * Safe translation lookup with dev-only missing key warnings.
 */
export function translate(key, lang = 'bn') {
  const dict = lang === 'bn' ? bnTranslations : enTranslations;
  if (key in dict) {
    return dict[key];
  }
  if (key in bnTranslations) {
    return bnTranslations[key];
  }
  if (isDev) {
    console.warn(`[i18n warning] Missing translation key: "${key}" for language "${lang}"`);
  }
  return key;
}

/**
 * Creates a translator function t(key) bound to a specific language.
 */
export function createTranslator(lang = 'bn') {
  return (key) => translate(key, lang);
}

/**
 * Wraps dictionary in a dev Proxy so accessing t.some_key logs a warning if missing.
 */
export function getDictionaryWithDevWarnings(dict, lang = 'bn') {
  if (!isDev) return dict;
  return new Proxy(dict, {
    get(target, prop) {
      if (typeof prop === 'string' && !(prop in target)) {
        console.warn(`[i18n warning] Missing translation property: "${prop}" for language "${lang}"`);
        if (prop in bnTranslations) return bnTranslations[prop];
        return prop;
      }
      return target[prop];
    }
  });
}
