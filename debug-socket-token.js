// Debug Socket.IO JWT Token Flow
require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('=== Socket.IO JWT Token Debug ===\n');

// 1. Check JWT_SECRET
console.log('1. Backend JWT_SECRET Check:');
console.log('   JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('   JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('   JWT_SECRET first 10 chars:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'Not set\n');

// 2. Frontend token source
console.log('2. Frontend Token Source:');
console.log('   Token comes from: useAuthToken() hook');
console.log('   Token location: document.cookie (token=...)');
console.log('   Hook code: src/app/hooks/useAuthToken.ts\n');

// 3. Frontend token sending
console.log('3. Frontend Token Sending:');
console.log('   File: src/app/hooks/useSocket.ts');
console.log('   Lines: 47-54');
console.log('   Method: io(SOCKET_URL, { auth: { token }, extraHeaders: { Authorization: `Bearer ${token}` } })');
console.log('   Token sent in TWO places:');
console.log('     - socket.handshake.auth.token');
console.log('     - socket.handshake.headers.Authorization\n');

// 4. Backend token receiving
console.log('4. Backend Token Receiving:');
console.log('   File: socketService.js (setupMiddleware function)');
console.log('   Token extraction:');
console.log('     let token = socket.handshake.auth.token ||');
console.log('                   socket.handshake.headers.authorization ||');
console.log('                   socket.handshake.headers.Authorization;\n');

// 5. Test token verification
console.log('5. Token Verification Test:');
console.log('   To test with your actual token:');
console.log('   1. Open browser console');
console.log('   2. Look for "Token payload:" in the logs');
console.log('   3. Copy the full token');
console.log('   4. Replace "YOUR_TOKEN_HERE" below and run this script\n');

// Replace this with your actual token from browser console
const testToken = 'YOUR_TOKEN_HERE';

if (testToken !== 'YOUR_TOKEN_HERE') {
  try {
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ Token verification successful!');
    console.log('   User ID:', decoded.userId);
    console.log('   Username:', decoded.username);
    console.log('   Expires:', new Date(decoded.exp * 1000));
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    console.log('   Error type:', error.name);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('   This means JWT_SECRET mismatch!');
      console.log('   Solutions:');
      console.log('   1. Check your backend .env file has JWT_SECRET');
      console.log('   2. Make sure JWT_SECRET matches the one used for login');
      console.log('   3. Restart your backend server');
      console.log('   4. Log out and log back in to get fresh token');
    }
  }
} else {
  console.log('   Please replace "YOUR_TOKEN_HERE" with your actual token');
}

console.log('\n=== Debug Complete ==='); 