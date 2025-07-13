const { Worker } = require("bullmq");
const redisConnection = require("../Config/RedisConfig");
const nodemailer = require("nodemailer")
const path = require("path")
const dotenv = require("dotenv")
dotenv.config();

// KEYS bull:email-queue:*
// LLEN bull:email-queue:waiting
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

        // Handle regular email jobs
        const { to, subject, text, options = {} } = job.data;

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
  name: "SafeSpace",
  website: "https://safespace.in",
  supportEmail: "support@safespace.in",
  socialLinks: {
    facebook: "https://facebook.com/SafeSpaceIndia",
    instagram: "https://instagram.com/SafeSpaceAI",
  },
  ...options.templateData, // Allows caller to override branding
};


        // 2. Define the email options
        const mailOptions = {
            from: `"${companyData.name}" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
html: `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0F172A, #1E293B); padding: 24px; text-align: center;">
      <img src="cid:company-logo" alt="SafeSpace" style="height: 48px;" />
      <h1 style="color: #fff; font-size: 20px; margin-top: 8px;">Stay Aware. Stay Safe.</h1>
    </div>

    <!-- Body -->
    <div style="background-color: #ffffff; padding: 24px;">
      <h2 style="color: #1E293B; font-size: 18px; margin-bottom: 12px;">${subject}</h2>
      <p style="color: #374151; font-size: 14px; line-height: 1.6;">${text}</p>

      <div style="margin: 24px 0; padding: 16px; background-color: #F1F5F9; border-left: 4px solid #38BDF8;">
        <p style="margin: 0; font-size: 14px; color: #0F172A;">
          For urgent safety alerts or app support, contact us at
          <a href="mailto:${companyData.supportEmail}" style="color: #0EA5E9; text-decoration: none;">
            ${companyData.supportEmail}
          </a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 32px;">
        <a href="${companyData.website}" style="display: inline-block; background-color: #0EA5E9; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Open SafeSpace Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 12px; color: #6B7280;">
      <p style="margin-bottom: 10px;">Follow SafeSpace for real-time updates</p>
      <div style="margin-bottom: 10px;">
        <a href="${companyData.socialLinks.facebook}" style="margin: 0 10px; color: #3b5998; text-decoration: none;">Facebook</a>
        <a href="${companyData.socialLinks.instagram}" style="margin: 0 10px; color: #E1306C; text-decoration: none;">Instagram</a>
      </div>
      <p style="margin-top: 10px;">
        &copy; ${new Date().getFullYear()} ${companyData.name}. All rights reserved.
        <br />
        <a href="${companyData.website}/privacy" style="color: #6B7280; text-decoration: underline;">Privacy Policy</a> |
        <a href="${companyData.website}/terms" style="color: #6B7280; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>
  </div>
`,

            // Adding attachments
            attachments: [
                // Company logo as embedded image
                {
                    filename: "logo.png",
                    path: path.join(__dirname, "../../../public/images/logo.png"), // Update this path to your logo
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
            return null; // Return null to indicate failure
        }
    } catch (err) {
        console.log("Error in EmailWorker :: mailSend", err);
        throw err; 
    }
}, {
    connection: redisConnection, 
    concurrency: 5, // Number of jobs processed concurrently   
});


emailWorker.on("completed", (job) => {
    console.log(`EmailWorker Job ${job.id} completed successfully`);
})

emailWorker.on("failed", (job, error) => {
    console.error(`EmailWorker Job ${job.id} failed with error: ${error.message}`);
})


module.exports = emailWorker