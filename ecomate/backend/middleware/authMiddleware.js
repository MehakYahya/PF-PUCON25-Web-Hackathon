const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fix: Attach full decoded payload to req.user
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
