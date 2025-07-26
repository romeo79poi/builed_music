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

    // Supabase authentication errors
    if (error?.name === 'SupabaseConfigError') {
      return {
        type: 'auth',
        message: 'Supabase is not configured. The app is running in demo mode.',
        code: 'SUPABASE_CONFIG_ERROR',
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    if (error?.name === 'AuthError' || error?.code?.startsWith('auth')) {
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
