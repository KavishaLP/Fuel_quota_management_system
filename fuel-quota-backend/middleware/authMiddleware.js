import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // 1. Check token existence
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      code: 'MISSING_TOKEN',
      message: 'Authorization token required' 
    });
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: err.name === 'TokenExpiredError' 
          ? 'Session expired. Please log in again.'
          : 'Invalid authentication token'
      });
    }

    // 3. Attach minimal user data
    req.user = { 
      userId: decoded.userId 
      // Add other essential claims if needed
    };
    next();
  });
};