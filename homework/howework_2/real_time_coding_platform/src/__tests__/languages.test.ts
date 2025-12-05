import { describe, it, expect } from 'vitest';
import { languages, getLanguageById, getDefaultLanguage } from '@/lib/languages';

describe('languages', () => {
  describe('languages array', () => {
    it('should have all required languages', () => {
      const languageIds = languages.map(l => l.id);
      
      expect(languageIds).toContain('javascript');
      expect(languageIds).toContain('typescript');
      expect(languageIds).toContain('python');
      expect(languageIds).toContain('java');
      expect(languageIds).toContain('cpp');
      expect(languageIds).toContain('go');
    });

    it('should have default code for each language', () => {
      languages.forEach(lang => {
        expect(lang.defaultCode).toBeDefined();
        expect(lang.defaultCode.length).toBeGreaterThan(0);
      });
    });

    it('should have monacoId for each language', () => {
      languages.forEach(lang => {
        expect(lang.monacoId).toBeDefined();
      });
    });
  });

  describe('getLanguageById', () => {
    it('should return correct language for valid id', () => {
      const python = getLanguageById('python');
      expect(python).toBeDefined();
      expect(python?.name).toBe('Python');
    });

    it('should return undefined for invalid id', () => {
      const invalid = getLanguageById('invalid-language');
      expect(invalid).toBeUndefined();
    });
  });

  describe('getDefaultLanguage', () => {
    it('should return JavaScript as default', () => {
      const defaultLang = getDefaultLanguage();
      expect(defaultLang.id).toBe('javascript');
    });

    it('should be executable in browser', () => {
      const defaultLang = getDefaultLanguage();
      expect(defaultLang.canExecuteInBrowser).toBe(true);
    });
  });
});
