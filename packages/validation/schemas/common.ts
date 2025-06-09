/**
 * Common validation schemas and patterns
 */

import { z } from 'zod';
import validator from 'validator';

// Common regex patterns
export const REGEX_PATTERNS = {
  // Alphanumeric with spaces and basic punctuation
  SAFE_TEXT: /^[a-zA-Z0-9\s\-_.,'!?()]+$/,
  // Username pattern
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  // Phone number (international format)
  PHONE: /^\+?[1-9]\d{1,14}$/,
  // Postal code (various formats)
  POSTAL_CODE: /^[A-Z0-9\s-]{3,10}$/i,
  // URL slug
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  // Hex color
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Email validation with disposable email detection
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'mintemail.com',
  'temp-mail.org',
  'yopmail.com',
];

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .refine((email) => validator.isEmail(email), {
    message: 'Invalid email format',
  })
  .refine(
    (email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      return !DISPOSABLE_EMAIL_DOMAINS.includes(domain);
    },
    {
      message: 'Disposable email addresses are not allowed',
    }
  );

// Price validation (in dollars for legacy compatibility)
export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .multipleOf(0.01, 'Price must have at most 2 decimal places')
  .max(999999.99, 'Price must be less than 1,000,000');

// Price validation in cents (recommended for e-commerce)
export const priceCentsSchema = z
  .number()
  .int('Price must be a whole number in cents')
  .positive('Price must be positive')
  .max(99999999, 'Price must be less than $1,000,000');

// Currency validation
export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD'], {
  errorMap: () => ({ message: 'Invalid currency' }),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Date range schema
export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine((data) => data.from <= data.to, {
  message: 'Start date must be before or equal to end date',
  path: ['to'],
});

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.string(),
});

// Image file validation
export const imageFileSchema = fileUploadSchema.extend({
  type: z.enum([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ], {
    errorMap: () => ({ message: 'Invalid image format. Allowed: JPEG, PNG, WebP, GIF' }),
  }),
  size: z.number().max(5 * 1024 * 1024, 'Image size must be less than 5MB'),
});

// ID validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const cuidSchema = z.string().cuid('Invalid CUID format');
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Phone number validation
export const phoneSchema = z
  .string()
  .refine((phone) => validator.isMobilePhone(phone, 'any'), {
    message: 'Invalid phone number',
  });

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine((url) => validator.isURL(url, { 
    protocols: ['http', 'https'],
    require_protocol: true,
  }), {
    message: 'Invalid URL format',
  });

// Safe text validation (prevents XSS)
export const safeTextSchema = z
  .string()
  .trim()
  .min(1, 'Text cannot be empty')
  .refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  });

// Username validation
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(REGEX_PATTERNS.USERNAME, 'Username can only contain letters, numbers, underscores, and hyphens');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .refine((password) => validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  }), {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  });

// Address validation
export const addressSchema = z.object({
  street: z.string().trim().min(1).max(100).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }),
  city: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }),
  state: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  postalCode: z.string().regex(REGEX_PATTERNS.POSTAL_CODE, 'Invalid postal code'),
  country: z.string().length(2, 'Country must be 2-letter ISO code'),
});

// Coordinates validation
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Search query validation
export const searchQuerySchema = z.object({
  q: z.string().trim().max(100).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  filters: z.record(z.string(), z.any()).optional(),
  ...paginationSchema.shape,
});

// Request body size limit helper
export const createSizeLimitedSchema = <T extends z.ZodTypeAny>(
  schema: T,
  maxSizeBytes: number = 1024 * 1024 // 1MB default
) => {
  return z.preprocess((val) => {
    if (typeof val === 'string' && val.length > maxSizeBytes) {
      throw new Error(`Request body too large. Maximum size: ${maxSizeBytes} bytes`);
    }
    return val;
  }, schema);
};