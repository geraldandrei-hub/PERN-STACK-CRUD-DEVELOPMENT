const {z} = require('zod');

//request-body contracts for the auth endpoints
const registerSchema = z.object({
    email: z.string().trim().email('A valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const loginSchema = z.object({
    email: z.string().trim().email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
});

module.exports = {registerSchema, loginSchema};