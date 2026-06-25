/**
 * FormData type for the contact form
 * Shared between frontend and API
 */
export interface ContactFormData {
  name: string;
  userType: "citoyen" | "maire_ou_elu";
  city: string;
  email: string;
  message: string;
}

/**
 * Payload sent to Google Script
 * Uses snake_case field names for backend compatibility
 */
export interface GoogleScriptPayload {
  nom: string;
  situation: string;
  ville: string;
  email: string;
  message: string;
}
