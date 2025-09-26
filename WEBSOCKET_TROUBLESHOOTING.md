# WebSocket Connection Troubleshooting

## Common Issues and Solutions

### 1. "WebSocket connection failed" Error

**Problem**: WebSocket connection to 'ws://localhost:8012/socket.io/' failed

**Solutions**:
- **Backend not running**: Make sure your Socket.IO server is running on port 8012
- **Wrong port**: Check if your backend is running on a different port
- **CORS issues**: Ensure your backend has CORS configured properly

### 2. "Socket auth error: invalid signature" Error

**Problem**: Authentication token is invalid or expired

**Solutions**:
- **Token expired**: Log out and log back in to get a fresh token
- **Wrong token format**: Make sure the token is being sent correctly
- **Backend JWT secret mismatch**: Check if your backend JWT secret matches

### 3. Connection Timeout

**Problem**: Connection takes too long or times out

**Solutions**:
- **Network issues**: Check your internet connection
- **Firewall blocking**: Ensure port 8012 is not blocked
- **Backend overloaded**: Check if your backend server is running properly

## Environment Setup

### 1. Backend Requirements

Make sure your backend has:
- Socket.IO server running on port 8012
- JWT authentication middleware
- CORS configured for your frontend domain

### 2. Frontend Environment

Add to your `.env.local`:
```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:8012
```

### 3. Backend Socket.IO Setup Example

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// JWT Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
});
```

## Testing Connection

### 1. Check Backend Status

```bash
# Check if port 8012 is listening
netstat -an | grep 8012

# Or use curl to test the endpoint
curl http://localhost:8012
```

### 2. Browser Console

Open browser console and look for:
- Connection success messages
- Error messages with details
- Network tab for WebSocket connections

### 3. Manual Connection Test

```javascript
// In browser console
const socket = io('http://localhost:8012', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

## Debug Steps

1. **Check Backend**: Ensure Socket.IO server is running
2. **Check Token**: Verify JWT token is valid and not expired
3. **Check Network**: Ensure no firewall blocking port 8012
4. **Check CORS**: Verify backend CORS settings
5. **Check Environment**: Confirm NEXT_PUBLIC_SOCKET_URL is set correctly

## Common Backend Issues

### 1. CORS Configuration
```javascript
// Make sure CORS is properly configured
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
```

### 2. JWT Secret Mismatch
```javascript
// Ensure JWT_SECRET matches between auth and socket middleware
const JWT_SECRET = process.env.JWT_SECRET;
```

### 3. Socket.IO Version Compatibility
```bash
# Check Socket.IO versions match
npm list socket.io socket.io-client
```

## Fallback Options

If WebSocket connection fails, the chat will:
1. Show connection error message
2. Disable message input
3. Display helpful error information
4. Attempt to reconnect automatically

## Support

If issues persist:
1. Check browser console for detailed error messages
2. Verify backend logs for authentication errors
3. Test with a simple Socket.IO client
4. Ensure all environment variables are set correctly 