import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bnTranslations from '../i18n/bn.json';
import enTranslations from '../i18n/en.json';
import { translate, createTranslator } from '../i18n/translate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '..');

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

  it('statically extracts all translation keys in src and verifies they exist in both bn.json and en.json', () => {
    function getSourceFiles(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // Skip test folder and node_modules
          if (file !== 'test' && file !== 'node_modules' && file !== 'styles') {
            results = results.concat(getSourceFiles(fullPath));
          }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
          results.push(fullPath);
        }
      });
      return results;
    }

    const files = getSourceFiles(srcDir);
    const bnKeys = new Set(Object.keys(bnTranslations));
    const enKeys = new Set(Object.keys(enTranslations));

    const tCallRegex = /\bt\(\s*['"]([a-zA-Z0-9_\-]+)['"]\s*\)/g;
    const tPropRegex = /\bt\.([a-zA-Z0-9_]+)\b/g;
    const tBracketRegex = /\bt\[\s*['"]([a-zA-Z0-9_\-]+)['"]\s*\]/g;

    const ignoredProps = new Set([
      'target', 'type', 'title', 'timestamp', 'trim', 'toLowerCase', 'toUpperCase', 'time',
      'total', 'test', 'text', 'then', 'top', 'toString', 'length', 'split', 'replace',
      'join', 'filter', 'map', 'some', 'every', 'includes', 'indexOf', 'slice', 'substr', 'substring'
    ]);

    const missingInBn = [];
    const missingInEn = [];

    files.forEach((file) => {
      const rawContent = fs.readFileSync(file, 'utf8');
      // Strip JavaScript comments so comments describing t.some_key are not treated as code
      const content = rawContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      const relativePath = path.relative(srcDir, file);

      let match;
      while ((match = tCallRegex.exec(content)) !== null) {
        const key = match[1];
        if (!bnKeys.has(key)) missingInBn.push({ key, file: relativePath });
        if (!enKeys.has(key)) missingInEn.push({ key, file: relativePath });
      }

      while ((match = tPropRegex.exec(content)) !== null) {
        const key = match[1];
        if (!ignoredProps.has(key)) {
          if (!bnKeys.has(key)) missingInBn.push({ key, file: relativePath });
          if (!enKeys.has(key)) missingInEn.push({ key, file: relativePath });
        }
      }

      while ((match = tBracketRegex.exec(content)) !== null) {
        const key = match[1];
        if (!bnKeys.has(key)) missingInBn.push({ key, file: relativePath });
        if (!enKeys.has(key)) missingInEn.push({ key, file: relativePath });
      }
    });

    expect(missingInBn, `Keys used in src but missing in bn.json: ${JSON.stringify(missingInBn, null, 2)}`).toHaveLength(0);
    expect(missingInEn, `Keys used in src but missing in en.json: ${JSON.stringify(missingInEn, null, 2)}`).toHaveLength(0);
  });

  it('logs console.warn in dev when a key is missing in translation helper', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const missingResult = translate('completely_non_existent_key_12345', 'bn');
    expect(missingResult).toBe('completely_non_existent_key_12345');
    expect(warnSpy).toHaveBeenCalled();

    const tHelper = createTranslator('en');
    const helperResult = tHelper('another_missing_key_67890');
    expect(helperResult).toBe('another_missing_key_67890');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[i18n warning] Missing translation key: "another_missing_key_67890"')
    );

    warnSpy.mockRestore();
  });
});
