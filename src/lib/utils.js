/**
 * Utility functions for the application
 */

/**
 * Executes a function with retry capability
 * @param {Function} fn - The async function to execute
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @param {number} backoffFactor - Factor to increase delay by with each retry (default: 1.5)
 * @returns {Promise<any>} - Returns the result of the function
 */
export const withRetry = async (
  fn,
  maxRetries = 3,
  delay = 1000,
  backoffFactor = 1.5
) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      lastError = error;
      
      // Don't wait on the last attempt
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoffFactor, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

/**
 * Check if a URL is valid
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Format bytes to a human-readable format
 * @param {number} bytes - The number of bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted string with units
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Generate a unique ID
 * @returns {string} - A unique ID
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Safely decode URI component with fallback
 * @param {string} str - The string to decode
 * @returns {string} - Decoded string or original if decoding fails
 */
export const safeDecodeURIComponent = (str) => {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    console.error('Error decoding URI component:', e);
    return str;
  }
}; 