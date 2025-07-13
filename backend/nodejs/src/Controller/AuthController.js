
/* AuthController */
const UserModel = require("../Model/UserModel");
const MailUtil = require("../Utils/MailUtil")
const jwtUtil = require("../Utils/JwtUtil")
const EncryptUtil = require("../Utils/EncryptUtil")
const OtpUtil = require("../Utils/OtpUtil")
const SmsUtil = require("../Utils/SmsUtil")


// add user + mail
const addUser = async (req, res) => {
    console.log("addUser controller called...");

    try {
        req.body.password = EncryptUtil.encryptPassword(req.body.password);

        const savedUser = await UserModel.create(req.body);
        console.log("addUser() : savedUser : ", savedUser);

        // mailSend
        const mailResponse = await MailUtil.mailSend(savedUser.email, "welcome mail", "Your account has been created successfully.");
        console.log("mailResponse : ", mailResponse);
        if (!mailResponse) {
            return res.status(500).json({
                message: "Error in sending mail",
                data: {},
            });
        }
        console.log("Mail sent successfully to: ", savedUser.email);

        res.status(201).json({
            message: "User Registered Successfully",
            data: savedUser,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: "Email already exists",
                data: {}
            });
        }

        return res.status(500).json({
            message: "Internal Server Error for addUser or MailSend",
            data: err,
        });
    }
};

// forgetPassword
const forgetPassword = async (req, res) => {
    console.log("AuthController :: forgetPassword called...");

    console.log("req.body : ", req.body);

    const email = req.body.email;
    const foundUser = await UserModel.findOne({ email: email });
    if (!foundUser) {
        return res.status(404).json({
            message: "User not found for this email",
            data: {},
        });
    } else {
        const url = `http://localhost:3001/auth/resetPassword?email=${foundUser.email}`;

        const mailResponse = await MailUtil.mailSend(
            foundUser.email, 
            "Forget Password", 
            `Click on this link to reset your password: <a href="${url}">Reset Password</a>`,
        );


        if (mailResponse) {
            res.status(200).json({
                message: "Mail sent successfully",
                data: {},
            });
        } else {
            res.status(500).json({
                message: "Error in sending forgetPassword mail",
                data: {},
            });
        }
    }
};

// resetPassword
const resetPassword = async (req, res) => {
    
    req.body.newPassword = EncryptUtil.encryptPassword(req.body.newPassword);
    const newPassword = req.body.newPassword;

    const email = req.query.email;
    const foundUser = await UserModel.findOne({ email: email });

    if (!foundUser) {
        return res.status(404).json({
            message: "User not found for this email",
            data: {},
        });
    } else {
        const updatedUser = await UserModel.findByIdAndUpdate(foundUser._id, { password: newPassword }, { new: true });

        if (updatedUser) {
            res.status(200).json({
                message: "Password updated successfully",
                data: updatedUser,
            });
        } else {
            res.status(500).json({
                message: "Error in updating password",
                data: {},
            });
        }
    }
};

/* JWT --> Token */
// 1. login with Email + Password
const loginUserWithEmailPassword = async(req, res) => {
    console.log("loginUserWithEmailPassword controller called...");

    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            message: "Email and Password are required", 
            data : {}
        })
    }


    const userFromEmail = await UserModel.findOne({email: email});
    if(!userFromEmail) {
        res.status(404).json({
            message: "User not found",
            data: {}
        })
    } else {
        // if find then check password [plainPassword, hashedPassword]
        const isPasswordMatch = EncryptUtil.comparePassword(password, userFromEmail.password); // apiPassword, dbPassword
        if(isPasswordMatch) {
            // generate tokens 
            const accessToken = jwtUtil.generateAccessToken(userFromEmail._id);
            const refreshToken = jwtUtil.generateRefreshToken(userFromEmail._id);

            // update refreshToken in db
            await userFromEmail.updateOne({refreshToken: refreshToken});  

            console.log("Login Successfull with Email + Password: ", userFromEmail);

            res.status(200).json({
                message: "Login Successfull with Email + Password", 
                // data: userFromEmail
                // token: token,
                tokens: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
            })
        } else {
            res.status(401).json({
                message: "Invalid Credentials!",
                data: {}
            })
        }
    }
}

// 2. login with Mobile + Password
const loginUserWithMobilePassword = async (req, res) => {
    console.log("loginUserWithMobile controller called...");

    const {mobile, password} = req.body;

    // validate
    if (!mobile || !password) {
        return res.status(400).json({
            message: "Mobile and Password are required",
            data: {}
        })
    }

    try {
        const userFromMobile = await UserModel.findOne({mobile: mobile});
        if (!userFromMobile) {
            return res.status(404).json({
                message: "User not found with this mobile number",
                data: {}
            });
        }

        const isPasswordMatch = EncryptUtil.comparePassword(password, userFromMobile.password);
        if (isPasswordMatch) {
            // generate tokens
            const accessToken = jwtUtil.generateAccessToken(userFromMobile._id);
            const refreshToken = jwtUtil.generateRefreshToken(userFromMobile._id);

            // update refreshToken in db
            await userFromMobile.updateOne({refreshToken: refreshToken});

            console.log("Login Successfull with Mobile + Password: ", userFromMobile);

            return res.status(200).json({
                message: "Login Successfull with Mobile + Password",
                tokens: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
            });
        } else {
            return res.status(401).json({
                message: "Invalid Credentials!",
                data: {}
            });
        }
    } catch (error) {
        console.log("Error in loginUserWithMobile: ", error)
        return res.status(500).json({
            message: "Internal Server Error in loginUserWithMobile",
            error: error.message
        });
    }
}

// 3. login with Email + OTP --> Generate OTP and send via Email
// - loginUserWithEmailOTP
// - verifyEmailOTP
const loginUserWithEmailOTP = async (req, res) => {
    console.log("loginUserWithEmailOTP controller called...");

    const {email} = req.body;

    // validate
    if (!email) {
        return res.status(400).json({
            message: "Email is required",
            data: {}            
        })
    }

    try {
        const userFromEmail = await UserModel.findOne({email: email})
        if (!userFromEmail) {
            return res.status(404).json({
                message: "User not found with this email",
                data: {}
            });
        }

        // generate 6 digit OTP
        const otp = OtpUtil.generateOTP();

        // store OTP in Redis with TTL of 5 minutes
        const isOtpStored = await OtpUtil.storeOTP(email, otp);
        if (!isOtpStored) {
            return res.status(500).json({
                message: "Error storing OTP in Redis",
                data: {}
            })
        }

        // send OTP via Email
        const mailResponse = await MailUtil.mailSend(
            email, 
            "Login OTP",
            `Your OTP for login is: ${otp}. It is valid for 5 minutes.`
        );

        if (mailResponse && mailResponse.success) {
            return res.status(200).json({
                message: "OTP sent successfully to your email",
                data: {}
            });
        } else {
            return res.status(500).json({
                message: "Error sending OTP via email",
                data: {}
            });
        }
 
    }catch (error) {
        console.error("Error in loginUserWithEmailOTP: ", error);
        return res.status(500).json({
            message: "Internal Server Error in loginUserWithEmailOTP",
            error: error.message
        });
    }
}
// verifyEmailOTP
const verifyEmailOTP = async (req, res) => {
    console.log("verifyEmailOTP controller called...");

    const {email, otp} = req.body;
    // validate
    if (!email || !otp) {
        return res.status(400).json({
            message: "Email and OTP are required",
            data: {}
        })
    }

    try {
        const verification = await OtpUtil.verifyOTP(email, otp);

        if (verification.valid) {
            const userFromEmail = await UserModel.findOne({email: email});
            if (!userFromEmail) {
                return res.status(404).json({
                    message: "User not found with this email",
                    data: {}
                });
            }

            // generate tokens
            const accessToken = jwtUtil.generateAccessToken(userFromEmail._id);
            const refreshToken = jwtUtil.generateRefreshToken(userFromEmail._id);

            // update refreshToken in db
            await userFromEmail.updateOne({refreshToken: refreshToken});
            console.log("Login Successfull with OTP : ", userFromEmail);

            return res.status(200).json({
                message: "Login Successfull with Email + OTP",
                tokens: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            });
        }  else {
            return res.status(401).json({
                message: verification.message,
                data: {}
            })
        }
    } catch(error) {
        console.error("Error in verifyEmailOTP: ", error);
        return res.status(500).json({
            message: "Internal Server Error in verifyEmailOTP",
            error: error.message
        });
    }
}

// 4. login with Mobile + OTP --> Generate OTP and send via Mobile
// - loginUserWithMobileOTP
// - verifyMobileOTP
const loginUserWithMobileOTP = async (req, res) => {
    console.log("loginUserWithMobileOTP controller called...");
    const {mobile} =req.body;

    // validate
    if (!mobile) {
        return res.status(400).json({
            message: "Mobile number is required",
            data: {}
        })
    }

    try {
        const userFromMobile = await UserModel.findOne({mobile: mobile});
        if (!userFromMobile) {
            return res.status(404).json({
                message: "User not found with this mobile number",
                data: {}
            });
        }

        // generate 6 digit OTP
        const otp = OtpUtil.generateOTP();

        // store OTP in Redis with TTL of 5 minutes
        const isOtpStored = await OtpUtil.storeOTP(mobile, otp);
        if (!isOtpStored) {
            return res.status(500).json({
                message: "Error storing OTP in Redis",
                data: {}
            })
        }

        // send OTP via SMS
        const smsResponse = await SmsUtil.sendSMS(
            mobile, 
            `Your OTP for login is: ${otp}. It is valid for 5 minutes.`
        );

        if (smsResponse && smsResponse.success) {
            return res.status(200).json({
                message: smsResponse.message,
                data: {}
            });
        } else {
            return res.status(500).json({
                message: "Error sending OTP via SMS",
                data: {error: smsResponse.error}
            });
        }
    } catch (error) {
        console.error("Error in loginUserWithMobileOTP: ", error);
        return res.status(500).json({
            message: "Internal Server Error in loginUserWithMobileOTP",
            error: error.message
        });
    }
}
// verifyMobileOTP
const verifyMobileOTP = async (req, res) => {
    console.log("verifyMobileOTP controller called...");
    const {mobile, otp} = req.body;

    // validate
    if (!mobile || !otp) {
        return res.status(400).json({
            message: "Mobile number and OTP are required",
            data: {}
        })
    }

    try {
        const verification = await OtpUtil.verifyOTP(mobile, otp);
        if (verification.valid) {
            const userFromMobile = await UserModel.findOne({mobile: mobile});
            if (!userFromMobile) {
                return res.status(404).json({
                    message: "User not found with this mobile number",
                    data: {}
                });
            }

            // generate tokens
            const accessToken = jwtUtil.generateAccessToken(userFromMobile._id);
            const refreshToken = jwtUtil.generateRefreshToken(userFromMobile._id);

            // update refreshToken in db
            await userFromMobile.updateOne({refreshToken: refreshToken});

            console.log("Login Successfull with Mobile + OTP: ", userFromMobile);

            return res.status(200).json({
                message: "Login Successfull with Mobile + OTP",
                tokens: {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            });
        } else {
            return res.status(401).json({
                message: verification.message,
                data: {}
            });
        }
    } catch (error) {
        console.error("Error in verifyMobileOTP: ", error);
        return res.status(500).json({
            message: "Internal Server Error in verifyMobileOTP",
            error: error.message
        });
    }
}



// refreshAccessToken [using refreshToken --> re-login]
const refreshAccessToken = async (req, res) => {
    console.log("refreshAccessToken controller called...");

    const {refreshToken} = req.body;    

    if(refreshToken) {
        try {
            
            // verify refresh token 
            // 1. check it is present in the db
            const userFromRefreshToken = await UserModel.findOne({refreshToken: refreshToken});
            if(userFromRefreshToken) {
                
                // 2. verify the refresh token from the jwtUtil refreshTokens store of set
                const isValidRefreshToken = jwtUtil.verifyAccessToken(refreshToken);
                if(isValidRefreshToken) {
                    // 3. if valid then check if it is not expired
                    const isRefreshTokenExpired = jwtUtil.isTokenExpired(refreshToken);
                    if (isRefreshTokenExpired) {
                        return res.status(401).json({
                            message: "Refresh token expired. Please login again.",
                            code: "REFRESH_TOKEN_EXPIRED"
                        });
                    } else {
                        // 4. generate new access token from the refresh token
                        const newAccessToken = jwtUtil.refreshAccessToken(refreshToken);
                        
                        return res.status(200).json({
                            message: "Access token refreshed successfully",
                            data: {
                                accessToken: newAccessToken
                            }
                        });
                    }

                } else {
                    return res.status(401).json({
                        message: "Invalid refresh token - not verified",
                        code: "INVALID_REFRESH_TOKEN"
                    });
                }

            } else {
                return res.status(401).json({
                    message: "Invalid refresh token - not found in database",
                    code: "INVALID_REFRESH_TOKEN"
                });
            }
            
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: "Refresh token expired. Please login again.",
                    code: "REFRESH_TOKEN_EXPIRED"
                });
            }
            
            return res.status(401).json({
                message: "Invalid refresh token",
                error: error.message
            });
        }
    } else {
        return res.status(400).json({
            message: "Refresh token is required", 
            data: {}
        })
    }
}


// logoutUser
const logoutUser = async (req, res) => {
    console.log("logoutUser controller called... ");

    const authHeader = req.headers.authorization;
    let accessToken = null;
    const refreshToken = req?.body?.refreshToken; 

    if(authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
    }


    if (accessToken) {
        try {
            // 1. blacklist the access token
            if (jwtUtil.blacklistAccessToken(accessToken)) {
                // 2. check if refresh token is provided, invalidate it as well
                if (refreshToken) {
                    const userFromRefreshToken = await UserModel.findOne({ refreshToken: refreshToken });
                    if (userFromRefreshToken) {
                        // 3. update refreshToken in db with null
                        await userFromRefreshToken.updateOne({ refreshToken: null });
                    } else {
                        return res.status(404).json({
                            message: "User not found for the provided refreshToken",
                            data: {}
                        });
                    }
                } else {
                    // If refresh token is not provided, we still want to update the user's refreshToken in db to null
                    const userFromAccessToken = await UserModel.findOne({_id: jwtUtil.verifyAccessToken(accessToken).userId})
                    if (userFromAccessToken) {
                        await userFromAccessToken.updateOne({ refreshToken: null });
                    } else {
                        return res.status(404).json({
                            message: "User not found for the provided accessToken",
                            data: {}
                        });
                    }
                }
            
                return res.status(200).json({
                    message: "Logout successful",
                    data: {}
                });
            } else {
                return res.status(400).json({
                    message: "Invalid access token",
                    data: {}
                });
            }

        } catch (error) {
            console.error("Error during logout: ", error);
            return res.status(500).json({
                message: "Error during logout",
                data: {}
            });
        }
    } else {
        if (refreshToken) {
            const userFromRefreshToken = await UserModel.findOne({ refreshToken: refreshToken });
            if (userFromRefreshToken) {
                // 3. update refreshToken in db with null
                await userFromRefreshToken.updateOne({ refreshToken: null });

                return res.status(200).json({
                    message: "Logout successful",
                    data: {}
                });
            } else {
                return res.status(404).json({
                    message: "User not found for the provided refreshToken",
                    data: {}
                });
            }
        } else {
            return res.status(400).json({
                message: "accessToken or refreshToken is required for logout",
                data: {}
            });
        }
    }


}


module.exports = {
    addUser,
    forgetPassword,
    resetPassword,
    loginUserWithEmailPassword,
    loginUserWithMobilePassword,
    loginUserWithEmailOTP, verifyEmailOTP,
    loginUserWithMobileOTP, verifyMobileOTP, 
    refreshAccessToken, 
    logoutUser
}