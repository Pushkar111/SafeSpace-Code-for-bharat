const twilio = require("twilio");

const dotenv = require("dotenv");
dotenv.config();

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

const sendSMS = async (to, body) => {
    try {
        const smsResponse = await twilioClient.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER, 
            to: `+91${to}` 
        })
        
        console.log(`SmsUtil :: SMS sent successfully with ${smsResponse.sid}`);

        return {
            success: true,
            message: `SMS sent successfully to ${to}`,
            sid: smsResponse.sid
        };
    } catch (error) {
        console.error("SmsUtil :: Error sending SMS:", error);
        return { success: false, error: error.message };;
    }
}

module.exports = {
    sendSMS
}