// Debug script to test JWT token
const jwt = require('jsonwebtoken');

// Test your JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
console.log('JWT_SECRET available:', !!JWT_SECRET);
console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);

// Test token verification (replace with your actual token)
const testToken = 'your-actual-token-here';

try {
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('Token verification successful:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
} 