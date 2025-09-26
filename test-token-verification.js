// Test token verification with actual token
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Replace this with your actual token from the frontend console
const actualToken = 'PASTE_YOUR_ACTUAL_TOKEN_HERE';

console.log('=== Token Verification Test ===');
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

if (actualToken === 'PASTE_YOUR_ACTUAL_TOKEN_HERE') {
  console.log('❌ Please replace the token with your actual token from the frontend console');
  console.log('Copy the token from your browser console and paste it here');
} else {
  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    console.log('✅ Token verification successful!');
    console.log('Decoded payload:', decoded);
    console.log('User ID:', decoded.userId);
    console.log('Username:', decoded.username);
    console.log('Issued at:', new Date(decoded.iat * 1000));
    console.log('Expires at:', new Date(decoded.exp * 1000));
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    console.log('Error type:', error.name);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('This means the JWT_SECRET used to verify the token');
      console.log('does not match the one used to create the token.');
    }
  }
} 