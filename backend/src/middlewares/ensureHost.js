module.exports = function (req, res, next) {
  if (req.session && req.session.user && 
      (req.session.user.role === "host" || req.session.user.role === "both")) {
    return next();
  }

  return res.status(403).json({ error: "Host only" });
};