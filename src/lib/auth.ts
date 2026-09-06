"use client";

// TEMPORARY client-side admin gate.
// This is NOT secure production authentication — it only keeps casual
// visitors out of the admin UI during local development/demo. The password
// is stored in plain text in this browser's localStorage, which is fine for
// a single-admin local/demo setup but must NOT be treated as real security.
//
// Before going live, replace this with real server-side auth
// (e.g. NextAuth/Auth.js with hashed credentials, or your backend's
// session/JWT auth) and move all admin data operations behind an
// authenticated API instead of the browser-only store in store.ts.

const SESSION_KEY = "hsc_admin_session";
const PASSWORD_KEY = "hsc_admin_password";
const FACTORY_DEFAULT_PASSWORD = "hsconstructions2024";

export function getPassword(): string {
  if (typeof window === "undefined") return FACTORY_DEFAULT_PASSWORD;
  return window.localStorage.getItem(PASSWORD_KEY) || FACTORY_DEFAULT_PASSWORD;
}

export function login(password: string): boolean {
  if (password === getPassword()) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }
    return true;
  }
  return false;
}

export function logout() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}

/**
 * Changes the admin password. Requires the current password to confirm.
 * Returns an error message on failure, or null on success.
 */
export function changePassword(currentPassword: string, newPassword: string): string | null {
  if (currentPassword !== getPassword()) {
    return "Current password is incorrect.";
  }
  if (newPassword.trim().length < 6) {
    return "New password must be at least 6 characters.";
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PASSWORD_KEY, newPassword.trim());
  }
  return null;
}
