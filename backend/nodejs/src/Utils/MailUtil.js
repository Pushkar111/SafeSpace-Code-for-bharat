// npm i nodemailer

const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");
const { addEmailJob } = require("../Redis/Queue/EmailQueue");
dotenv.config();

const mailSend = async (to, subject, text, options = {}) => {
    
    // === With redis email sending functionality ===
    try {
        const jobId = await addEmailJob(to, subject, text, options);

        if(jobId) {
            console.log(`Email job added successfully with ID: ${jobId}`);
            return { success: true, jobId }; 
        } else {
            console.log("Error in adding email job");
            return { success: false, message: "Failed to add email job" };
        }
    } catch (err) {
        console.log("Error in MailUtil :: mailSend", err);
        return null; // Always return something to handle errors properly
    }




    // === Uncomment the code below to enable without redis(directly) email sending functionality ===
    /*
    try {
        // 1. Create a transporter - object that will send the email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER, // Your email address
                pass: process.env.GMAIL_PASS, // Your app specific password
            },
        });

        // Default company data
        const companyData = {
            name: "Amazon",
            website: "https://www.amazon.com/",
            supportEmail: "support@amazon.com",
            socialLinks: {
                facebook: "https://www.facebook.com/AmazonIN",
                instagram: "https://www.facebook.com/AmazonIN",
            },
            ...options.templateData, // Merge with any additional data passed in options
        };

        // 2. Define the email options
        const mailOptions = {
            from: `"${companyData.name}" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <div style="background-color: #232F3E; padding: 20px; text-align: center;">
                            <img src="cid:company-logo" alt="${companyData.name}" style="height: 40px;" />
                        </div>

                        <!-- Body -->
                        <div style="background-color: #ffffff; padding: 20px;">
                            <h2 style="color: #232F3E; font-size: 20px; margin-bottom: 15px;">${subject}</h2>
                            <p style="color: #555; font-size: 14px; line-height: 1.6;">${text}</p>

                            <div style="margin: 30px 0; padding: 15px; background-color: #f6f6f6; border-left: 4px solid #FF9900;">
                                <p style="margin: 0; font-size: 14px; color: #333;">
                                    Need help? Contact us at
                                    <a href="mailto:${companyData.supportEmail}" style="color: #FF9900; text-decoration: none;">
                                        ${companyData.supportEmail}
                                    </a>
                                </p>
                            </div>

                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${
                                    companyData.website
                                }" style="display: inline-block; background-color: #FF9900; color: #fff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                                    Shop Now
                                </a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f2f2f2; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                            <p style="margin-bottom: 10px;">Follow us</p>
                            <div style="margin-bottom: 10px;">
                                <a href="${companyData.socialLinks.facebook}" style="margin: 0 10px; color: #3b5998; text-decoration: none;">Facebook</a>
                                <a href="${companyData.socialLinks.instagram}" style="margin: 0 10px; color: #E1306C; text-decoration: none;">Instagram</a>
                            </div>
                            <p style="margin-top: 10px;">
                                &copy; ${new Date().getFullYear()} ${companyData.name}. All rights reserved.
                                <br />
                                <a href="${companyData.website}/privacy" style="color: #777; text-decoration: underline;">Privacy Policy</a> |
                                <a href="${companyData.website}/terms" style="color: #777; text-decoration: underline;">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                    `,
            // Adding attachments
            attachments: [
                // Company logo as embedded image
                {
                    filename: "logo.png",
                    path: path.join(__dirname, "../../public/images/logo.png"), // Update this path to your logo
                    cid: "company-logo", // Referenced in the HTML as cid:company-logo
                },
                // Additional attachments provided by the caller
                ...(options.attachments || []), // pass by async function with to, subject, text, attachments
            ],
        };

        const mailResponse = await transporter.sendMail(mailOptions);
        if (mailResponse) {
            console.log("Email sent successfully");
            return mailResponse;
        } else {
            console.log("Error in sending email");
            return null;
        }
    } catch (err) {
        console.log("Error in MailUtil :: mailSend", err);
        return null; // Always return something to handle errors properly
    }
    */
};

module.exports = {
    mailSend,
};































/* Basic Code */

// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// dotenv.config();

// const mailSend = async(to, subject, text) => {
//     try {
//         // 1. Create a transporter - object that will send the email
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.GMAIL_USER, // Your email address
//                 pass: process.env.GMAIL_PASS, // Your app specific password
//             }
//         })

//         // 2. Define the email options
//         const mailOptions = {
//             from: process.env.GMAIL_USER, // sender
//             to: to, // receiver
//             subject: subject, // Subject line
//             // text: text, // plain text body,
//             html: `
//                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                 <h2 style="color: #333;">${subject}</h2>
//                 <p style="color: #555; line-height: 1.5;">${text}</p>
//                 <p style="color: #555;">Thank you for using our service!</p>
//                 <p style="margin-top: 20px; color: #777;">Best regards,<br>Your Company Name</p>
//                </div>
//             `
//         }

//         const mailResponse = await transporter.sendMail(mailOptions);
//         if (mailResponse) {
//             console.log("Email sent successfully");
//             return mailResponse;
//         } else {
//             console.log("Error in sending email");
//             return null;
//         }

//     } catch (err) {
//         console.log("Error in MailUtil :: mailSend", err);
//     }
// }

// module.exports = {
//     mailSend
// }
