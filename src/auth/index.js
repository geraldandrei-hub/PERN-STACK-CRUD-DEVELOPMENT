// Composition root for the auth feature: construct the dependency graph once
// (pool → repository → service → controller) and export a ready-to-mount router.

const pool = require('../config/db');
const AuthRepository = require('./auth.repository');
const AuthService = require('./auth.service');
const AuthController = require('./auth.controller');
const buildAuthRouter = require('./auth.route');

const repository = new AuthRepository(pool);
const service = new AuthService(repository);
const controller = new AuthController(service);

module.exports = buildAuthRouter(controller);