const zod = require("zod");

const LoginValidationSchema = zod.object({
    email: zod.string().email("Invalid email format"),
    password: zod.string().min(1, "Password is required")
}).strict();

module.exports = LoginValidationSchema;