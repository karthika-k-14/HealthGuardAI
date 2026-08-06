// Supported UI languages. Full translation strings are out of scope
// for this milestone — the selector persists a choice and exposes it
// via LanguageContext so components can react to it once real i18n
// content is wired in.
export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
];

export const DEFAULT_LANGUAGE_CODE = 'en';
