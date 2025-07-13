const mongoose = require("mongoose");
const Schema = mongoose.Schema; 


const userSchema = new Schema({
    //  Fields 

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    mobile: {
        type: String, 
        unique: true,
        sparse: true // Allows NULL values (not all users may have a mobile number)
    }, 
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        sparse: true
    },
    age: {
        type: Number,
        required: function() {
            return this.isCompleteProfile === true;
        }
    }, 
    gender: {
        type: String
    }, 
    isActive: {
        type: Boolean,
        default: true
    }, 
    hobbies: [
        {
            type: String
        }
    ],
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: function() {
            return this.isCompleteProfile === true;
        }
    }, 
    role: { // works like roleId - can be string for SafeSpace
        type: Schema.Types.Mixed, // Allow both ObjectId and String
        default: "user"
    }, 
    refreshToken: {
        type: String,
        default: null
    }, 
    // SafeSpace specific fields
    savedThreats: [
        {
            id: Number,
            savedAt: {
                type: Date,
                default: Date.now
            },
            title: String,
            category: String
        }
    ],
    notificationSettings: {
        email: {
            type: Boolean,
            default: true
        },
        push: {
            type: Boolean,
            default: true
        },
        threats: {
            type: Boolean,
            default: true
        },
        safety: {
            type: Boolean,
            default: true
        }
    },
    preferredCities: [String],
    isCompleteProfile: {
        type: Boolean,
        default: false
    }, 
    profilePic: {
        url: String, 
        cloudinaryId: String, // public_Id from cloudinary
        uploadAt: {
            type: Date,
            default: Date.now
        }
    }, 
    gallery: [
        {
            url: String, 
            cloudinaryId: String, 
            uploadAt: {
                type: Date, 
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
}); 

module.exports = mongoose.model("users", userSchema);