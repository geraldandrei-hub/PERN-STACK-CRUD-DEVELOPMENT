const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {ConflictError, UnauthorizedError} = require('../errors');

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';

// Business rules only. No HTTP, no raw SQL. Receives the repository via
// the constructor so the whole layer is unit-testable with a fake repo.

class AuthService {
    constructor(repo) {
        this.repo = repo;
    }

    async register({email, password}) {
        const normalizedEmail = email.trim().toLowerCase();
        
        const existingUser = await this.repo.findByEmail(normalizedEmail);
        if(existingUser) {
            throw new ConflictError('Email is already registered');
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await this.repo.create({email: normalizedEmail, passwordHash});
        return this.#toPublicUser(user);

    }

    async login({email, password}){
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.repo.findByEmail(normalizedEmail);

        if(!user) throw new UnauthorizedError('Invalid email or password');

        const ok = await bcrypt.compare(password, user.password_hash);
        if(!ok) throw new UnauthorizedError('Invalid email or password');
        return this.#toPublicUser(user);
    }
    async getUserById(id) {
        const user = await this.repo.findById(id);
        if(!user) throw new UnauthorizedError('User not found');
        return this.#toPublicUser(user);
    }

    issueToken(user) {
        return jwt.sign({id: user.id, email: user.email}, 
            process.env.JWT_SECRET, 
            {expiresIn: TOKEN_TTL});
    }

    #toPublicUser(user) {
        return{
            id: user.id,
            email: user.email,
            createdAt: user.created_at

        }
    }
    
}

module.exports = AuthService;   