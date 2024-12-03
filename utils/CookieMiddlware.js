const CookieMiddleware = (req, res, next) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    return res.status(403).json({
      message: "Failed to Provide access_token cookie",
      reason: "NO accessToken",
    });
  } else {
    next();
  }
};

module.exports = { CookieMiddleware };
