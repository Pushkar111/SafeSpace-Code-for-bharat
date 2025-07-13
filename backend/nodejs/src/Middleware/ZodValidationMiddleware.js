const zodValidationMiddleware = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body); // req.body is same as the schema validation
        next();
    } catch (err) {
        res.status(400).json({
            error: "Validation Error",
            message: err.errors.map((error) => error.message).join(", "),
            details: err.errors,
        })
    }
}

module.exports = zodValidationMiddleware;