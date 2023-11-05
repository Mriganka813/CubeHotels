const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mysecretKey';

exports.isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;

  try {
    if (token) {
      // Verify the token
      const decodedToken = jwt.verify(token, JWT_SECRET);

      // Check if the token is valid
      if (decodedToken) {
        // Store the decoded token in the request object
        req.user = decodedToken;
        // Make the 'user' object available in all EJS templates
        res.locals.user = req.user;
      }
    } else {
      // If no token is found, set 'user' to null or another default value
      res.locals.user = null; // Or any other default value
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle invalid signature error
      return res.status(401).json({ error: 'Invalid token signature' });
    }

    console.error(error);
    return res.status(500).json({ error: 'An error occurred during authentication' });
  }
};
