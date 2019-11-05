var jwt = require("express-jwt");
var secret = require("../config").secret;

function getTokenFromHeader(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Token"
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

// Create a route middleware to handle decoding JWT's for two different authentication cases (optional and required)
var auth = {
  required: jwt({
    secret: secret,
    userProperty: "payload",
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: "payload",
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
