// Single source of truth for localStorage keys so the app never
// duplicates raw string literals across contexts/utils.
export const STORAGE_KEYS = {
  TOKEN: 'hg_token',
  ROLE: 'hg_role',
  USER: 'hg_user',
  LAST_ROUTE: 'hg_last_route',
  THEME: 'hg_theme',
  LANGUAGE: 'hg_language',
  ONBOARDING_COMPLETED: 'hg_onboarding_completed',
  CHAT_CITIZEN: 'hg_chat_citizen',
  CHAT_ASHA: 'hg_chat_asha',
  CHAT_OFFICER: 'hg_chat_officer',
  CHAT_ADMIN: 'hg_chat_admin',
};
