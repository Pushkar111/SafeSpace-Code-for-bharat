const zod = require("zod");

const UserValidationSchema = zod.object({
    name: zod.string().min(2, "Name is minimum 2 characters"),
    email: zod.string().email("Invalid email format").optional(), // Made email optional
    password: zod.string().min(5, "Password is minimum 5 characters"),
    age: zod.number().min(1, "Age is minimum 1").max(100, "Age must be less than 100"),
    gender: zod.string().refine(val => val.toLowerCase() === "male" || val.toLowerCase() === "female", {
        message: "Gender must be either 'male' or 'female'"
    }), 
    isActive: zod.boolean().default(true),
    hobbies: zod.array(zod.string()),
    bloodGroup: zod.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
        required_error: "Blood group is required",
        invalid_type_error: "Invalid blood group"
    }),
    role: zod.string()

}).strict() // strict() not allows the extra fields 


module.exports = UserValidationSchema;