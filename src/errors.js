class AppError extends Error {
    constructor(message,status) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
    }
}

class BadRequestError extends AppError {constructor(m = "Bad Request") {super(m, 400);}}
class UnauthorizedError extends AppError {constructor(m = "Unauthorized") {super(m, 401);}}
class NotFoundError extends AppError {constructor(m = "Not Found") {super(m, 404);}}
class ConflictError extends AppError {constructor(m = "Conflict") {super(m, 409);}}

module.exports = {
    AppError, BadRequestError, UnauthorizedError, NotFoundError, ConflictError
};