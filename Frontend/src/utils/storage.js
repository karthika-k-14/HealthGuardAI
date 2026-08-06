// Thin wrapper around localStorage that never throws (e.g. private
// browsing mode, storage disabled) and always returns predictable values.

export function getItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn(`storage.getItem failed for "${key}"`, err);
    return null;
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`storage.setItem failed for "${key}"`, err);
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`storage.removeItem failed for "${key}"`, err);
  }
}

export function getJSON(key, fallback = null) {
  const raw = getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`storage.getJSON failed to parse "${key}"`, err);
    return fallback;
  }
}

export function setJSON(key, value) {
  setItem(key, JSON.stringify(value));
}
