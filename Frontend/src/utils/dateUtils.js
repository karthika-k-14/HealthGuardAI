/**
 * Derives a person's current age in whole years from a stored date
 * of birth. The app never stores age directly — every surface that
 * needs an age (profile display, symptom-checker defaults, etc.)
 * computes it from dateOfBirth via this single function.
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}
