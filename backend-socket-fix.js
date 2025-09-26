// Fixed Socket.IO middleware
setupMiddleware() {
  // Authentication middleware
  this.io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization ||
                  socket.handshake.headers.Authorization;
      
      console.log('Received token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('Socket connection attempt without token');
        return next(new Error('Authentication error: No token provided'));
      }

      // Remove 'Bearer ' prefix if present
      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }

      // Check if JWT_SECRET is available
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not found in environment variables');
        return next(new Error('Authentication error: Server configuration error'));
      }

      console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
      console.log('Token length:', token.length);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully for user:', decoded.userId);
      
      const user = await User.findById(decoded.userId).select('username profileImage');
      
      if (!user) {
        console.log(`User not found for userId: ${decoded.userId}`);
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = decoded.userId;
      socket.username = user.username;
      socket.profileImage = user.profileImage;
      
      console.log(`Socket authenticated for user: ${user.username} (${decoded.userId})`);
      next();
    } catch (error) {
      console.error('Socket auth error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'JsonWebTokenError') {
        next(new Error('Authentication error: Invalid token signature'));
      } else if (error.name === 'TokenExpiredError') {
        next(new Error('Authentication error: Token expired'));
      } else {
        next(new Error(`Authentication error: ${error.message}`));
      }
    }
  });
} 