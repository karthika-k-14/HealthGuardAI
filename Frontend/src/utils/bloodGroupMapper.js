/**
 * UI Blood Group Labels ('A+', 'A-', 'B+', etc.) <-> Backend Enum values ('A_POSITIVE', 'A_NEGATIVE', etc.)
 * Single source of truth for Blood Group conversions across the React application.
 */

export const UI_TO_BACKEND_BLOOD_GROUP = {
  'A+': 'A_POSITIVE',
  'A-': 'A_NEGATIVE',
  'B+': 'B_POSITIVE',
  'B-': 'B_NEGATIVE',
  'AB+': 'AB_POSITIVE',
  'AB-': 'AB_NEGATIVE',
  'O+': 'O_POSITIVE',
  'O-': 'O_NEGATIVE',
};

export const BACKEND_TO_UI_BLOOD_GROUP = Object.fromEntries(
  Object.entries(UI_TO_BACKEND_BLOOD_GROUP).map(([ui, backend]) => [backend, ui])
);

// Standard list of blood group options for UI dropdowns/selects
export const BLOOD_GROUP_OPTIONS = Object.keys(UI_TO_BACKEND_BLOOD_GROUP);

/**
 * Converts UI blood group string (e.g. "A+") to backend Enum string (e.g. "A_POSITIVE").
 * If value is already in backend format, returns it as is.
 * Returns null if input is null/undefined/empty.
 */
export function toBackendBloodGroup(uiValue) {
  if (!uiValue) return null;
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (validGroups.includes(uiValue)) {
    return uiValue;
  }
  const enumToStandard = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
  };
  return enumToStandard[uiValue] || uiValue;
}

/**
 * Converts backend Enum string (e.g. "A_POSITIVE") to UI label (e.g. "A+").
 * If value is already in UI format, returns it as is.
 * Returns empty string or fallback if null/undefined.
 */
export function toDisplayBloodGroup(backendValue, fallback = '') {
  if (!backendValue) return fallback;
  const enumToStandard = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
  };
  return enumToStandard[backendValue] || backendValue || fallback;
}
