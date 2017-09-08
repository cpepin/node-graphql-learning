const jwt = require('jsonwebtoken');
const { jwtPassword } = require('./constants');

const HEADER_REGEX = /bearer (.*)$/;

/**
 * This is an extremely simple token. In real applications make
 * sure to use a better one, such as JWT (https://jwt.io/).
 */
module.exports.authenticate = async ({ headers: { authorization } }, Users) => {
  const token = authorization && HEADER_REGEX.exec(authorization)[1];
  if (token) {
    const decodedJwt = await jwt.verify(token, jwtPassword);
    return await Users.findOne({ email: decodedJwt.email });
  }
  return false;
}
