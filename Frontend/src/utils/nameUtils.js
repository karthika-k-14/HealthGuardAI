/**
 * Formats a raw user name or email string into a clean, human-readable display name.
 * e.g., "citizen3@healthguard.app" -> "Citizen 3"
 *       "john.doe@healthguard.app" -> "John Doe"
 *       "citizen@healthguard.app"  -> "Citizen"
 *       "Ananya Sharma"            -> "Ananya Sharma"
 */
export function formatCitizenName(name, email) {
  if (name && typeof name === 'string' && name.trim() && !name.includes('@')) {
    return name.trim();
  }

  const target = (name && typeof name === 'string' && name.includes('@')) ? name : (email || '');
  if (!target || !target.includes('@')) {
    return name || 'Assigned Citizen';
  }

  const handle = target.split('@')[0];
  const formatted = handle
    .replace(/[._-]+/g, ' ')
    .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();

  return formatted || 'Assigned Citizen';
}
