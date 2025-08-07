// Global error handler for Firebase/Firestore permission errors
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections (like Firestore permission errors)
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    // Check if it's a Firebase permission error
    if (error && error.code === "permission-denied") {
      console.warn("⚠️ Firebase permission denied, continuing in offline mode");
      event.preventDefault(); // Prevent the error from being shown in console
      return;
    }

    // Check if it's a Firestore snapshot listener error
    if (
      error &&
      error.message &&
      error.message.includes("Missing or insufficient permissions")
    ) {
      console.warn(
        "⚠️ Firestore snapshot listener permission denied, ignoring",
      );
      event.preventDefault(); // Prevent the error from being shown in console
      return;
    }

    // Let other errors through
  });

  // Handle regular errors
  window.addEventListener("error", (event) => {
    const error = event.error;

    if (
      error &&
      error.message &&
      error.message.includes("Missing or insufficient permissions")
    ) {
      console.warn("⚠️ Firestore error caught, continuing in offline mode");
      event.preventDefault();
      return;
    }
  });
};

// Call this early in the app initialization
setupGlobalErrorHandler();
