const { Worker } = require("bullmq");
const redisConnection = require("../Config/RedisConfig");
const nodemailer = require("nodemailer")
const path = require("path")
const dotenv = require("dotenv")
dotenv.config();

const emailWorker = new Worker("email-queue", async (job) => {
    console.log(`EmailWorker Processing email-queue with job ${job.id} with data:`, job.data);

    try {
        // Create a transporter
        const transporter = nodemailer.createTransporter({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        // Handle different job types
        if (job.name === "send-welcome-email") {
            const { name, email } = job.data;
            
            const mailOptions = {
                from: `"SafeSpace" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: "Welcome to SafeSpace - Your Safety Journey Begins!",
                html: `
                <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #0284c7, #0369a1); padding: 32px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ Welcome to SafeSpace!</h1>
                    </div>
                    <div style="padding: 32px; background: #fff;">
                        <h2 style="color: #1f2937; margin-top: 0;">Hello ${name}!</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Thank you for joining SafeSpace - your intelligent safety companion. You're now part of a community dedicated to staying informed and safe.
                        </p>
                        <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                            <h3 style="color: #1f2937; margin-top: 0;">🚀 Get Started:</h3>
                            <ul style="color: #4b5563; margin: 0;">
                                <li>Explore real-time threat intelligence</li>
                                <li>Set up your location preferences</li>
                                <li>Customize notification settings</li>
                                <li>Save threats for later reference</li>
                            </ul>
                        </div>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${process.env.FRONTEND_URL}/dashboard" 
                               style="background: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                                Go to Dashboard
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                            Stay safe, stay informed!<br>
                            The SafeSpace Team
                        </p>
                    </div>
                </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to ${email}`);
            return;
        }

        // Handle regular email jobs (existing functionality)
        const { to, subject, text, options = {} } = job.data;

        // Default company data
        const companyData = {
            name: "SafeSpace",
            website: process.env.FRONTEND_URL || "https://safespace.in",
            supportEmail: "support@safespace.in",
            socialLinks: {
                facebook: "https://facebook.com/SafeSpaceIndia",
                instagram: "https://instagram.com/SafeSpaceAI",
            },
            ...options.templateData,
        };

        // Regular email options
        const mailOptions = {
            from: `"${companyData.name}" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                <div style="background: linear-gradient(135deg, #0F172A, #1E293B); padding: 24px; text-align: center;">
                    <h1 style="color: #fff; font-size: 20px; margin: 0;">SafeSpace</h1>
                    <p style="color: #94A3B8; margin: 8px 0 0 0;">Stay Aware. Stay Safe.</p>
                </div>
                <div style="padding: 32px; background: #fff;">
                    ${text}
                </div>
                <div style="background: #F8FAFC; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0;">
                    <p style="color: #64748B; font-size: 14px; margin: 0;">
                        Best regards,<br>The SafeSpace Team
                    </p>
                </div>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);

    } catch (err) {
        console.log("Error in EmailWorker :: mailSend", err);
        throw err; 
    }
}, {
    connection: redisConnection, 
    concurrency: 5,
});

emailWorker.on("completed", (job) => {
    console.log(`EmailWorker Job ${job.id} completed successfully`);
})

emailWorker.on("failed", (job, error) => {
    console.error(`EmailWorker Job ${job.id} failed with error: ${error.message}`);
})

module.exports = emailWorker
