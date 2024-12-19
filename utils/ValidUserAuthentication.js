const jwt = require("jsonwebtoken");

const ensureAuthentication = (req, res, next) => {
  // const { authorization } = req.headers;
  const auth = req.headers["authorization"] || req.headers["Authorization"];
  console.log("Authorization Header:", auth);

  if (!auth) {
    return res
      .status(403)
      .json({ message: "Failed to Provide JWT token", reason: "NO JWT" });
  }
  try {
    const decoded = jwt.verify(auth, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    req.user = decoded;
    // req.user = {
    //   name: decoded.name,
    //   email: decoded.email,
    //   userId: decoded.userId,
    // };
    next();
  } catch (err) {
    return res.status(403).json({ message: err.message, reason: err.name });
  }
};

module.exports = { ensureAuthentication };
