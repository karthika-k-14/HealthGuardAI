// Lightweight className combiner (no external dependency needed for
// the simple conditional-join use case this project has).
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
