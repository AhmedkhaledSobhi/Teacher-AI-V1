export const ensurePrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str : `${prefix}${str}`)
export const withoutSuffix = (str: string, suffix: string) =>
  str.endsWith(suffix) ? str.slice(0, -suffix.length) : str
export const withoutPrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str.slice(prefix.length) : str)

/**
 * Truncates a name if it exceeds the limit.
 * Shows first name + "..." if the full name is too long.
 * @param name - The full name to truncate
 * @param limit - Maximum character limit (default: 15)
 * @returns The truncated name with dots or full name if short enough
 */
export const truncateName = (name: string, limit: number = 15): string => {
  if (!name) return "";
  
  const trimmedName = name.trim();
  
  if (trimmedName.length <= limit) {
    return trimmedName;
  }
  
  // Get first name and truncate with dots
  const firstName = trimmedName.split(/\s+/)[0] || trimmedName;
  
  // If first name itself is longer than limit, truncate it
  if (firstName.length > limit - 3) {
    return firstName.slice(0, limit - 3) + "...";
  }
  
  return firstName + "...";
}

/**
 * Returns the display name with optional truncation.
 * Shows first name + "..." if the full name is too long.
 * @param name - The full name
 * @param limit - Maximum character limit (default: 15)
 * @returns Object with displayName, isTruncated, and fullName
 */
export const getDisplayName = (name: string, limit: number = 15): {
  displayName: string;
  isTruncated: boolean;
  fullName: string;
} => {
  if (!name) return { displayName: "", isTruncated: false, fullName: "" };
  
  const trimmedName = name.trim();
  
  if (trimmedName.length <= limit) {
    return { displayName: trimmedName, isTruncated: false, fullName: trimmedName };
  }
  
  // Get first name and truncate with dots
  const firstName = trimmedName.split(/\s+/)[0] || trimmedName;
  
  // If first name itself is longer than limit, truncate it
  if (firstName.length > limit - 3) {
    return { 
      displayName: firstName.slice(0, limit - 3) + "...", 
      isTruncated: true, 
      fullName: trimmedName 
    };
  }
  
  return { displayName: firstName + "...", isTruncated: true, fullName: trimmedName };
}
