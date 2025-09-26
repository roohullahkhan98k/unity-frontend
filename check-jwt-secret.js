// Check JWT_SECRET and test token verification
require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('=== JWT_SECRET Check ===');
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('JWT_SECRET first 10 chars:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'Not set');

// Test with a sample token (replace with your actual token)
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjY2NjY2NjY2NjY2NiIsInVzZXJuYW1lIjoiVGVzdFVzZXIiLCJpYXQiOjE3MzQ5NjgwMDAsImV4cCI6MTczNTA1NDQwMH0.example';

try {
  const decoded = jwt.verify(sampleToken, process.env.JWT_SECRET);
  console.log('✅ Token verification successful:', decoded);
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
  console.log('Error type:', error.name);
} 