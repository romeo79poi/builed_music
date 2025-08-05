// Firebase configuration - disabled to prevent permission errors
// Now using backend authentication instead

// Mock exports to maintain compatibility
export const auth = null;
export const db = null;
export const storage = null;
export const serverTimestamp = () => new Date().toISOString();
export const isFirebaseConfigured = false;

// Mock app export
export default null;
