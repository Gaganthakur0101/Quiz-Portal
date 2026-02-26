// Middleware to validate token from Authorization header (for cross-domain requests)
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const sessionId = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Verify the session ID exists in the session store
    req.sessionStore = req.sessionStore || require("connect-mongo").default;
    
    // For now, we'll just attach the sessionId to the request
    // The actual validation will happen when loading the session
    req.tokenSessionId = sessionId;
  }
  
  next();
};
