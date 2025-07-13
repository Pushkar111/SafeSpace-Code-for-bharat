const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20")
const UserModel = require("../Model/UserModel");
const crypto = require("crypto");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // check if user already exists in this GoogleID
        let userFromProfile = await UserModel.findOne({
            $or: [
                {googleId: profile.id},
                {email: profile.emails[0].value}
            ]
        })

        if (userFromProfile) {
            // update Google ID if user exists but does not have Google ID
            if (!userFromProfile.googleId) {
                userFromProfile = await UserModel.findByIdAndUpdate(userFromProfile._id, {googleId: profile.id, isVerified: true}, {new: true})
            } 
        } else {
            // create a new user
            userFromProfile = await UserModel.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: crypto.randomBytes(16).toString("hex"), // generate a random password
                googleId: profile.id,
                isVerified: true, // Google users are considered verified
                // set other required fields with default values
                age: 18, // default age
                gender: "male", // default gender
                bloodGroup: "O+", // default blood group
                hobbies: [],
                role: process.env.DEFAULT_ROLE_ID
            })

            console.log("PassportUtil :: New user created from Google:", userFromProfile);
        }

        return done(null, userFromProfile);
    } catch (error) {
        console.error("PassportUtil :: Error in Google Strategy:", error);
        return done(error, null);
    }
}))

// Serialize user to session --> means store user ID in session
passport.serializeUser((user, done) => {
    done(null, user._id);
})

// Deserialize user from session --> means fetch user details from DB using user ID
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return done(new Error("User not found"), null);
        }
        done(null, user);
    } catch (error) {
        console.error("PassportUtil :: Error in deserializeUser:", error);
        done(error, null);
    }   
})

module.exports = passport;