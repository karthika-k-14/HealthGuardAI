// Minimal Language Detection step for the AI pipeline. Uses Unicode
// script ranges rather than a manual language selector — this is a
// real (if simple) detector, distinct from LanguageContext's
// user-chosen interface language.
const SCRIPT_RANGES = [
  { code: 'hi', name: 'Hindi', pattern: /[\u0900-\u097F]/ },
  { code: 'ta', name: 'Tamil', pattern: /[\u0B80-\u0BFF]/ },
  { code: 'or', name: 'Odia', pattern: /[\u0B00-\u0B7F]/ },
];

export function detectLanguageFromText(text = '') {
  for (const script of SCRIPT_RANGES) {
    if (script.pattern.test(text)) {
      return { code: script.code, name: script.name, method: 'script-detection' };
    }
  }
  return { code: 'en', name: 'English', method: text.trim() ? 'script-detection' : 'default' };
}
