import { describe, it, expect } from 'vitest';
import bnTranslations from '../i18n/bn.json';
import enTranslations from '../i18n/en.json';

describe('i18n Parity & Content Safety', () => {
  it('has identical keys between bn.json and en.json', () => {
    const bnKeys = Object.keys(bnTranslations).sort();
    const enKeys = Object.keys(enTranslations).sort();

    expect(bnKeys).toEqual(enKeys);
    expect(bnKeys.length).toBeGreaterThan(150);
  });

  it('has non-empty values for every key', () => {
    for (const [key, val] of Object.entries(bnTranslations)) {
      expect(typeof val).toBe('string');
      expect(val.trim().length, `Empty value for key ${key} in bn.json`).toBeGreaterThan(0);
    }

    for (const [key, val] of Object.entries(enTranslations)) {
      expect(typeof val).toBe('string');
      expect(val.trim().length, `Empty value for key ${key} in en.json`).toBeGreaterThan(0);
    }
  });

  it('does not contain prohibited legal verdict or trust score claims', () => {
    const forbiddenPatterns = [
      /trust score/i,
      /fraud score/i,
      /guaranteed ownership/i,
      /ট্রাস্ট স্কোর/,
      /মালিকানার আইনি নিশ্চয়তা/
    ];

    const allowedExclusions = [
      'no single trust score',
      'no trust score',
      'not a legal verdict',
      'কোনো ট্রাস্ট স্কোর নেই',
      'আইনি সিদ্ধান্ত নয়'
    ];

    const checkDictionary = (dict, lang) => {
      for (const [key, val] of Object.entries(dict)) {
        const lower = val.toLowerCase();
        const hasExclusion = allowedExclusions.some(ex => lower.includes(ex));
        if (hasExclusion) continue;

        for (const pattern of forbiddenPatterns) {
          expect(pattern.test(val), `Key '${key}' in ${lang}.json contains forbidden pattern ${pattern}: "${val}"`).toBe(false);
        }
      }
    };

    checkDictionary(bnTranslations, 'bn');
    checkDictionary(enTranslations, 'en');
  });
});
