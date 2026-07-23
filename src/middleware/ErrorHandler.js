const {ZodError} = require('zod');
const {AppError} = require('../errors');

function errorHandler(err, req, res, next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "Validation Failed",
            details: err.issues.map((i) => ({
                field: i.path.join('.'),
                message: i.message
            })),
        });
    }

    if (err instanceof AppError) {
        return res.status(err.status).json({error : err.message});
    }
    console.error(err);
    return res.status(500).json({error: "Internal Server Error"});
}

module.exports = errorHandler;
