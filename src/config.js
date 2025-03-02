/**
 * Application configuration
 * 
 * This file contains configuration settings for the application.
 * When deploying to production, update the BASE_URL to your actual domain.
 */

// Base URL for the application
// In development, this will use the current origin (localhost)
// In production, replace this with your actual domain
const BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// Export configuration
const config = {
  BASE_URL,
  // Add other configuration settings here as needed
};

export default config; 