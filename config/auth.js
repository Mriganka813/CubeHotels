const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mysecretKey';


exports.isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;
    // console.log(token);
  if (!token) {
    return res.redirect('/user/login-page');
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // Check if the token is valid
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Store the decoded token in the request object
    req.user = decodedToken;
    // res.locals.user = user;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle invalid signature error
      return res.status(401).json({ error: 'Invalid token signature' });
    }

    console.error(error);
    return res
      .status(500)
      .json({ error: 'An error occurred during authentication' });
  }
};