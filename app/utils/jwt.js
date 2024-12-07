const jwt = require('jsonwebtoken');

function createJwtToken(payload, secretKey) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function verifyJwtToken(token, secretKey) {
  return jwt.verify(token, secretKey);
}

module.exports = {
  createJwtToken,
  verifyJwtToken,
};
