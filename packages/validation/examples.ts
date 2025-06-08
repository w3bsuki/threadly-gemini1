/**
 * Example usage of the validation package
 */

import { 
  // Schemas
  createProductSchema,
  emailSchema,
  createMessageSchema,
  
  // Sanitization
  sanitizeHtml,
  sanitizeText,
  filterProfanity,
  
  // Validators
  isValidProductTitle,
  checkPasswordStrength,
  
  // Middleware
  withValidation,
  
  // Types
  z,
} from '@repo/validation';

// Example 1: Validate a product submission
const validateProduct = () => {
  const productData = {
    title: 'Vintage Levi\'s Denim Jacket',
    description: 'Beautiful vintage denim jacket from the 1990s. Great condition with minor wear.',
    price: 89.99,
    category: 'UNISEX',
    subcategory: 'JACKETS',
    condition: 'VERY_GOOD',
    size: 'M',
    color: 'BLUE',
    brand: 'Levi\'s',
    images: [
      {
        url: 'https://utfs.io/f/abc123.jpg',
        alt: 'Front view',
        order: 0
      }
    ],
    quantity: 1,
  };

  try {
    const validated = createProductSchema.parse(productData);
    console.log('Product is valid:', validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
    }
  }
};

// Example 2: Sanitize user input
const sanitizeUserInput = () => {
  const userMessage = 'Check out my <script>alert("xss")</script> awesome product!';
  
  // Remove all HTML
  const sanitized = sanitizeText(userMessage);
  console.log('Sanitized:', sanitized);
  
  // Filter profanity
  const withProfanity = 'This is a damn good product!';
  const filtered = filterProfanity(withProfanity);
  console.log('Filtered:', filtered);
};

// Example 3: Validate email with disposable check
const validateEmail = async () => {
  const emails = [
    'user@gmail.com',
    'test@tempmail.com', // Disposable
    'invalid.email',
  ];
  
  for (const email of emails) {
    try {
      emailSchema.parse(email);
      console.log(`✓ ${email} is valid`);
    } catch (error) {
      console.log(`✗ ${email} is invalid`);
    }
  }
};

// Example 4: Check password strength
const checkPassword = () => {
  const passwords = [
    'password',      // Weak
    'Password1',     // Better
    'P@ssw0rd123!',  // Strong
  ];
  
  passwords.forEach(pwd => {
    const result = checkPasswordStrength(pwd);
    console.log(`Password: ${pwd}`);
    console.log(`Score: ${result.score}/4`);
    console.log(`Feedback: ${result.feedback.join(', ')}`);
    console.log(`Strong: ${result.isStrong}\n`);
  });
};

// Example 5: API Route with validation
import { NextRequest, NextResponse } from 'next/server';

export const POST = withValidation(
  async (request: NextRequest, data: z.infer<typeof createMessageSchema>) => {
    // Data is already validated and typed
    console.log('Validated message:', data);
    
    // Sanitize the content before saving
    const sanitizedContent = filterProfanity(data.content);
    
    // Process the message...
    
    return NextResponse.json({ success: true });
  },
  createMessageSchema,
  'body'
);

// Example 6: Custom validation for business rules
const validateBusinessRules = () => {
  const title = 'AMAZING DEAL!!!! BUY NOW!!!!';
  
  if (!isValidProductTitle(title)) {
    console.log('Title violates marketplace standards');
  }
};