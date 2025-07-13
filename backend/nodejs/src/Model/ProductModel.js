const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productStatus: {
        type: String, 
        enum: ["available", "notavailable"],
        default: "available"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("products", productSchema);