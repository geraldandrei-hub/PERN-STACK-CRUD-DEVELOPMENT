const jwt = require('jsonwebtoken');
const {UnauthorizedError} = require('../errors');

// Requires a valid JWT in the httpOnly "token" cookie.
function authenticate(req, res, next) {
    const token = req.cookies?.token;
    if(!token) {
        return next(new UnauthorizedError("No token provided"));
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: payload.sub, email: payload.email};
        next();
    } catch {
        next(new UnauthorizedError("Invalid token"));
    }
}

module.exports = authenticate;