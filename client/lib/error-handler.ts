// Comprehensive error handling utility for the Catch music app

export interface AppError {
  type: 'auth' | 'network' | 'database' | 'validation' | 'file' | 'unknown';
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxErrorHistory = 50;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Main error processing method
  handleError(error: any, context?: string): AppError {
    const appError = this.classifyError(error, context);
    this.logError(appError);
    this.addToHistory(appError);
    return appError;
  }

  // Classify errors by type and provide user-friendly messages
  private classifyError(error: any, context?: string): AppError {
    const timestamp = new Date().toISOString();

    // Supabase configuration errors
    if (error?.name === 'SupabaseConfigError') {
      return {
        type: 'auth',
        message: 'Supabase is not configured. The app is running in demo mode.',
        code: 'SUPABASE_CONFIG_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // Supabase authentication errors
    if (error?.name === 'AuthError' || error?.code?.startsWith('auth') || error?.error_description) {
      return {
        type: 'auth',
        message: this.getSupabaseAuthErrorMessage(error),
        code: error.code || error.error_code,
        details: { context, originalError: error },
        timestamp,
      };
    }

    // Supabase database errors
    if (error?.code?.startsWith('PGRST') || error?.hint || error?.details) {
      return {
        type: 'database',
        message: this.getSupabaseDatabaseErrorMessage(error),
        code: error.code,
        details: { context, originalError: error },
        timestamp,
      };
    }

    // Supabase storage errors
    if (error?.error === 'invalid_request' || error?.statusCode === 400) {
      return {
        type: 'file',
        message: this.getSupabaseStorageErrorMessage(error),
        code: error.error || 'STORAGE_ERROR',
        details: { context, originalError: error },
        timestamp,
      };
    }

    // Network/connectivity errors
    if (error?.message === 'Failed to fetch' || error?.name === 'NetworkError') {
      return {
        type: 'network',
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // Music player errors
    if (error?.message?.includes('audio') || context?.includes('player')) {
      return {
        type: 'file',
        message: this.getMusicPlayerErrorMessage(error),
        code: 'AUDIO_ERROR',
        details: { context, originalError: error },
        timestamp,
      };
    }

    // Legacy auth errors (keeping for backward compatibility)
    if (error?.code?.startsWith('auth')) {
      return {
        type: 'auth',
        message: this.getAuthErrorMessage(error),
        code: error.code,
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // Network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        code: 'FETCH_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
      return {
        type: 'network',
        message: 'Network error. Please try again.',
        code: 'NETWORK_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // Database errors
    if (error?.code?.startsWith('PGRST') || error?.message?.includes('database')) {
      return {
        type: 'database',
        message: 'Database error. Please try again later.',
        code: error.code || 'DATABASE_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // Validation errors
    if (error?.name === 'ValidationError' || error?.code === 'VALIDATION_ERROR') {
      return {
        type: 'validation',
        message: error.message || 'Invalid input provided.',
        code: 'VALIDATION_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // File upload errors
    if (error?.name === 'FileError' || error?.message?.includes('file')) {
      return {
        type: 'file',
        message: this.getFileErrorMessage(error),
        code: error.code || 'FILE_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // Generic unknown error
    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      details: { context, originalError: error.message || error.toString() },
      timestamp,
    };
  }

  private getAuthErrorMessage(error: any): string {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Invalid email or password. Please try again.';
      case 'email_not_confirmed':
        return 'Please verify your email address before logging in.';
      case 'phone_not_confirmed':
        return 'Please verify your phone number before logging in.';
      case 'signup_disabled':
        return 'Account registration is currently disabled.';
      case 'user_not_found':
        return 'No account found with this email address.';
      case 'weak_password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'email_address_invalid':
        return 'Please enter a valid email address.';
      case 'phone_number_invalid':
        return 'Please enter a valid phone number.';
      case 'too_many_requests':
        return 'Too many attempts. Please wait before trying again.';
      case 'email_address_not_authorized':
        return 'This email domain is not authorized to sign up.';
      default:
        return error.message || 'Authentication error. Please try again.';
    }
  }

  private getSupabaseAuthErrorMessage(error: any): string {
    // Handle Supabase-specific auth errors
    if (error?.error_description) {
      return error.error_description;
    }

    switch (error?.code || error?.error) {
      case 'invalid_credentials':
      case 'invalid_grant':
        return 'Invalid email or password. Please try again.';
      case 'email_not_confirmed':
        return 'Please check your email and click the verification link.';
      case 'phone_not_confirmed':
        return 'Please verify your phone number with the OTP code.';
      case 'signup_disabled':
        return 'New user registration is currently disabled.';
      case 'user_not_found':
        return 'No account found with this email address.';
      case 'weak_password':
        return 'Password must be at least 6 characters long.';
      case 'email_address_invalid':
        return 'Please enter a valid email address.';
      case 'phone_number_invalid':
        return 'Please enter a valid phone number with country code.';
      case 'too_many_requests':
        return 'Too many login attempts. Please wait a few minutes before trying again.';
      case 'email_address_not_authorized':
        return 'This email domain is not authorized for registration.';
      case 'captcha_failed':
        return 'Security verification failed. Please try again.';
      case 'oauth_provider_not_supported':
        return 'This social login provider is not available.';
      case 'session_not_found':
        return 'Your session has expired. Please log in again.';
      default:
        return error?.message || 'Authentication error. Please try again.';
    }
  }

  private getSupabaseDatabaseErrorMessage(error: any): string {
    // Handle Supabase/PostgreSQL database errors
    switch (error?.code) {
      case 'PGRST116':
        return 'No data found for your request.';
      case 'PGRST301':
        return 'Access denied. You don\'t have permission for this action.';
      case 'PGRST302':
        return 'Resource not found.';
      case 'PGRST204':
        return 'Data validation failed. Please check your input.';
      case '23505': // Unique violation
        return 'This data already exists. Please use different values.';
      case '23503': // Foreign key violation
        return 'Cannot complete this action due to data dependencies.';
      case '42P01': // Table doesn't exist
        return 'Database configuration error. Please contact support.';
      case '42703': // Column doesn't exist
        return 'Database schema error. Please contact support.';
      default:
        if (error?.hint) {
          return `Database error: ${error.hint}`;
        }
        return 'Database error. Please try again later.';
    }
  }

  private getSupabaseStorageErrorMessage(error: any): string {
    // Handle Supabase Storage errors
    switch (error?.error || error?.message) {
      case 'invalid_request':
        return 'Invalid file upload request. Please try again.';
      case 'file_too_large':
        return 'File is too large. Maximum size is 10MB.';
      case 'invalid_file_type':
        return 'File type not supported. Please upload MP3, WAV, or M4A files.';
      case 'storage_quota_exceeded':
        return 'Storage limit reached. Please delete some files first.';
      case 'unauthorized':
        return 'You don\'t have permission to upload files.';
      default:
        if (error?.statusCode === 413) {
          return 'File is too large. Please choose a smaller file.';
        }
        return 'File upload failed. Please try again.';
    }
  }

  private getMusicPlayerErrorMessage(error: any): string {
    // Handle music player specific errors
    if (error?.message?.includes('CORS')) {
      return 'Unable to play this song due to security restrictions.';
    }
    if (error?.message?.includes('codec') || error?.message?.includes('format')) {
      return 'Audio format not supported by your browser.';
    }
    if (error?.message?.includes('network')) {
      return 'Network error while loading audio. Please check your connection.';
    }
    if (error?.message?.includes('decode')) {
      return 'Audio file is corrupted or invalid.';
    }
    if (error?.code === 'MediaError') {
      return 'Unable to play this audio file.';
    }
    return 'Audio playback error. Please try again.';
  }

  private getFileErrorMessage(error: any): string {
    if (error.message?.includes('size')) {
      return 'File size is too large. Please choose a smaller file.';
    }
    if (error.message?.includes('type')) {
      return 'File type not supported. Please choose a different file.';
    }
    if (error.message?.includes('upload')) {
      return 'File upload failed. Please try again.';
    }
    return 'File error. Please try again.';
  }

  private logError(error: AppError): void {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 ${error.type.toUpperCase()} ERROR`);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      console.error('Timestamp:', error.timestamp);
      console.groupEnd();
    }

    // In production, you might want to send to error reporting service
    if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
      this.reportError(error);
    }
  }

  private reportError(error: AppError): void {
    // Example: Send to Sentry or other error reporting service
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(error.message), {
    //     tags: { type: error.type, code: error.code },
    //     extra: error.details
    //   });
    // }
  }

  private addToHistory(error: AppError): void {
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.maxErrorHistory) {
      this.errorQueue.shift();
    }
  }

  // Get error history for debugging
  getErrorHistory(): AppError[] {
    return [...this.errorQueue];
  }

  // Clear error history
  clearErrorHistory(): void {
    this.errorQueue = [];
  }

  // Get user-friendly error message with fallback
  getUserMessage(error: any, fallback = 'Something went wrong. Please try again.'): string {
    const appError = this.handleError(error);
    return appError.message || fallback;
  }

  // Check if error is retryable
  isRetryable(error: AppError): boolean {
    const retryableTypes: AppError['type'][] = ['network', 'database'];
    const retryableCodes = ['FETCH_ERROR', 'NETWORK_ERROR', 'TIMEOUT_ERROR'];
    
    return retryableTypes.includes(error.type) || 
           (error.code && retryableCodes.includes(error.code));
  }

  // Format error for display in UI
  formatErrorForUI(error: any): { title: string; description: string; variant: 'default' | 'destructive' } {
    const appError = this.handleError(error);
    
    const titles: Record<AppError['type'], string> = {
      auth: 'Authentication Error',
      network: 'Connection Error',
      database: 'Data Error',
      validation: 'Input Error',
      file: 'File Error',
      unknown: 'Error'
    };

    return {
      title: titles[appError.type],
      description: appError.message,
      variant: appError.type === 'validation' ? 'default' : 'destructive'
    };
  }
}

// Helper functions for common error scenarios
export const handleSupabaseError = (error: any, context?: string): AppError => {
  return ErrorHandler.getInstance().handleError(error, context);
};

export const handleNetworkError = (error: any, context?: string): AppError => {
  return ErrorHandler.getInstance().handleError(error, context);
};

export const handleValidationError = (message: string, context?: string): AppError => {
  const validationError = new Error(message);
  validationError.name = 'ValidationError';
  return ErrorHandler.getInstance().handleError(validationError, context);
};

export const handleFileError = (error: any, context?: string): AppError => {
  return ErrorHandler.getInstance().handleError(error, context);
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const errorHandler = ErrorHandler.getInstance();
    const appError = errorHandler.handleError(event.reason, 'unhandled_promise_rejection');
    
    // Only prevent default for non-critical errors in development
    if (import.meta.env.DEV && !appError.type.includes('auth')) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.handleError(event.error, 'global_error');
  });
}

export default ErrorHandler;
