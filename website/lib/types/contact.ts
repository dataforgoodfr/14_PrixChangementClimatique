/**
 * FormData type for the contact form
 * Shared between frontend and API
 */
export interface ContactFormData {
  name: string;
  city: string;
  email: string;
  message: string;
  insuranceQuestion?: "oui" | "non";
}

/**
 * Payload sent to Google Script
 * Uses snake_case field names for backend compatibility
 */
export interface GoogleScriptPayload {
  nom: string;
  ville: string;
  email: string;
  message: string;
  assurance_climatique: string;
}
