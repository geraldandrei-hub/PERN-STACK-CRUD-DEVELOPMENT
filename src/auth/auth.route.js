const {Router} = require('express');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const {registerSchema, loginSchema} = require('./auth.schema');

// URL + method → controller method. Wires validation/auth middleware. No logic.

function buildAuthRouter(controller) {
    const router = Router();

    router.post('/register', validate(registerSchema), controller.register);
    router.post('/login', validate(loginSchema), controller.login);
    router.post('/logout', controller.logout);
    router.get('/me', authenticate, controller.getMe);
    
    return router;
}

module.exports = buildAuthRouter;