// validate(schema, "body" | "params" | "query")
// Parses that part of the request; on success replaces it with the parsed data,
// on failure forwards the ZodError to the error handler (→ 400).
function validate(schema, source = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if(!result.success) return next(result.error);
        req[source] = result.data;
        next();
    };
}

module.exports = validate;