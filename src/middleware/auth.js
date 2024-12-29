const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
        isValid: false
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Calculate token expiration
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const timeToExpiry = decoded.exp - currentTimestamp;
      
      req.user = decoded;
      
      // Add token info to the response headers
      res.set({
        'X-Token-Expires-In': timeToExpiry,
        'X-Token-Valid': 'true'
      });
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token has expired',
          isValid: false,
          expiredAt: new Date(jwtError.expiredAt)
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid token format',
          isValid: false
        });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      message: 'Authentication failed',
      isValid: false,
      error: error.message
    });
  }
};