const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

function cookieOptions() {
    return {
        httpOnly: true,  // page JS can't read it (XSS-safe)
        sameSite: 'lax', // not sent on cross-site POSTs (CSRF defense)
        secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod, relaxed on localhost
        maxAge: COOKIE_MAX_AGE,
    };
    
// HTTP only: read the request, call ONE service method, shape the response.
// Methods are bound so they can be passed directly as route handlers.

class AuthController {
    constructor(service) {
        this.service = service;
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.getMe = this.getMe.bind(this);
    }

    async register(req, res, next) {
        try {
             const user = await this.service.register(req.body);
             res.cookie(COOKIE_NAME, this.service.issueToken(user), cookieOptions());
             res.status(201).json({user});
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const user = await this.service.login(req.body);
            res.cookie(COOKIE_NAME, this.service.issueToken(user), cookieOptions());
            res.status(200).json({user});

        } catch (error) {
            next(error);
        }
    }

    async logout(req, res,next) {
        try {
            res.clearCookie(COOKIE_NAME, cookieOptions());
            res.status(204).end();

        } catch(err) {
            next(err);
        }
    }

    async getMe(req,res,next) {
        try {
            const user = await this.service.getUserById(req.user.id);
            res.status(200).json({user});
        } catch(err) {
            next(err);
        }
    }
}

}

module.exports = AuthController;