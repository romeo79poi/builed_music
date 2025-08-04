import express from "express";
import {
  sendEmailVerificationWithJWT,
  verifyEmailWithJWT,
  verifyEmailWithCode,
  sendPasswordResetWithJWT,
  resetPasswordWithJWT,
  registerWithEmailVerification,
  loginWithEnhancedFeatures,
  resendVerificationEmail
} from "./auth-enhanced";

import {
  authenticateJWT,
  optionalAuth,
  rateLimit,
  validateRegistrationInput,
  validateLoginInput,
  securityHeaders
} from "../middleware/auth";

import { verifyEmailVerificationToken, verifyPasswordResetToken } from "../lib/email-jwt";

const router = express.Router();

// Apply security headers to all auth routes
router.use(securityHeaders);

// ==========================================
// JWT EMAIL VERIFICATION ROUTES
// ==========================================

// Send verification email with JWT token link
router.post('/verification/email/send', 
  rateLimit(3, 5 * 60 * 1000), // 3 attempts per 5 minutes
  sendEmailVerificationWithJWT
);

// Verify email using JWT token from link
router.post('/verification/email/verify-token', 
  rateLimit(10, 10 * 60 * 1000), // 10 attempts per 10 minutes
  verifyEmailWithJWT
);

// Verify email using backup code
router.post('/verification/email/verify-code', 
  rateLimit(5, 10 * 60 * 1000), // 5 attempts per 10 minutes
  verifyEmailWithCode
);

// Resend verification email
router.post('/verification/email/resend', 
  rateLimit(3, 5 * 60 * 1000), // 3 attempts per 5 minutes
  resendVerificationEmail
);

// ==========================================
// JWT PASSWORD RESET ROUTES
// ==========================================

// Send password reset email with JWT token link
router.post('/password/forgot', 
  rateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  sendPasswordResetWithJWT
);

// Validate password reset token (for frontend validation)
router.post('/password/validate-reset-token', 
  rateLimit(10, 5 * 60 * 1000), // 10 validation attempts per 5 minutes
  async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Reset token is required"
        });
      }

      const decoded = verifyPasswordResetToken(token);
      if (!decoded) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token"
        });
      }

      res.json({
        success: true,
        message: "Reset token is valid",
        email: decoded.email // Don't expose userId for security
      });

    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

// Reset password using JWT token from link
router.post('/password/reset-with-token', 
  rateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  resetPasswordWithJWT
);

// ==========================================
// ENHANCED REGISTRATION & LOGIN
// ==========================================

// Register user with automatic email verification
router.post('/register/email-verification', 
  rateLimit(5, 15 * 60 * 1000), // 5 registration attempts per 15 minutes
  validateRegistrationInput, 
  registerWithEmailVerification
);

// Enhanced login with verification status
router.post('/login/enhanced', 
  rateLimit(10, 15 * 60 * 1000), // 10 login attempts per 15 minutes
  validateLoginInput, 
  loginWithEnhancedFeatures
);

// ==========================================
// UTILITY ROUTES
// ==========================================

// Validate email verification token (for frontend validation)
router.post('/verification/email/validate-token', 
  rateLimit(10, 5 * 60 * 1000),
  async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Verification token is required"
        });
      }

      const decoded = verifyEmailVerificationToken(token);
      if (!decoded) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token"
        });
      }

      res.json({
        success: true,
        message: "Verification token is valid",
        email: decoded.email
      });

    } catch (error) {
      console.error("Validate verification token error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

// Get verification status for authenticated user
router.get('/verification/status', 
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = (req as any).user;

      res.json({
        success: true,
        verification_status: {
          email_verified: user.email_verified,
          account_verified: user.is_verified,
          user_id: userId,
          email: user.email
        }
      });

    } catch (error) {
      console.error("Get verification status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

// ==========================================
// DEVELOPMENT ROUTES (for testing)
// ==========================================

if (process.env.NODE_ENV === 'development') {
  // Generate test verification link
  router.post('/dev/generate-verification-link', 
    async (req, res) => {
      try {
        const { email, userId } = req.body;
        const { generateEmailVerificationToken } = await import('../lib/email-jwt');
        
        const token = generateEmailVerificationToken(email, userId);
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${token}`;

        res.json({
          success: true,
          verificationLink,
          token,
          expiresIn: '1 hour'
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to generate verification link"
        });
      }
    }
  );

  // Generate test password reset link
  router.post('/dev/generate-reset-link', 
    async (req, res) => {
      try {
        const { email, userId } = req.body;
        const { generatePasswordResetToken } = await import('../lib/email-jwt');
        
        const token = generatePasswordResetToken(email, userId);
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;

        res.json({
          success: true,
          resetLink,
          token,
          expiresIn: '1 hour'
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to generate reset link"
        });
      }
    }
  );
}

// ==========================================
// HEALTH CHECK
// ==========================================

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: "Enhanced JWT Auth service is healthy",
    features: [
      'JWT Email Verification Links',
      'JWT Password Reset Links', 
      'Enhanced Registration',
      'Verification Status Tracking',
      'Secure Token Validation'
    ],
    timestamp: new Date().toISOString(),
    version: "4.0.0"
  });
});

export default router;
