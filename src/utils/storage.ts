const STORAGE_PREFIX = 'piano-app_'

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const fullKey = STORAGE_PREFIX + key
    const item = localStorage.getItem(fullKey)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  }
  catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    const fullKey = STORAGE_PREFIX + key
    localStorage.setItem(fullKey, JSON.stringify(value))
  }
  catch {
    console.warn('Failed to save to localStorage')
  }
}

export function removeStorageItem(key: string): void {
  try {
    const fullKey = STORAGE_PREFIX + key
    localStorage.removeItem(fullKey)
  }
  catch {
    console.warn('Failed to remove from localStorage')
  }
}
