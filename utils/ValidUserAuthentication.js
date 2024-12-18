// good template to use

const jwt = require("jsonwebtoken");

// const ValidUserAuthentication = (req, res, next) => {
const ensureAuthentication = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(403)
      .json({ message: "Failed to Provide JWT token", reason: "NO JWT" });
  }
  try {
    var decoded = jwt.verify(authorization, process.env.JWT_SECRET);
    req.user = {
      name: decoded.name,
      email: decoded.email,
      userId: decoded.userId,
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: err.message, reason: err.name });
  }
};

module.exports = { ensureAuthentication };
