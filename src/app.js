const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./auth');
const errorHandler = require('./middleware/errorHandler');

// Builds and returns the Express app WITHOUT starting a server, so tests
// can import it directly without opening a port.

function buildApp() {
    const app = express();

    app.use(
        cors({
            originL: process.env.CORS_ORIGIN,
            credentials:true,
        })
    );

    app.use(express.json());
    app.use(cookieParser());

    app.get('/health', (req,res) => res.json({status: 'ok'}));
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);

    return app;
}
module.exports = buildApp;