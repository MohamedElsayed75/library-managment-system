const jwt = require('jsonwebtoken');
const SECRET = 'my_super_secret_1234567890';


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ errorMessage: 'Access token missing' });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ errorMessage: 'Invalid or expired token' });
    }

    req.user = user; // has member_id, is_admin, name
    next();
  });
}

module.exports = authenticateToken;