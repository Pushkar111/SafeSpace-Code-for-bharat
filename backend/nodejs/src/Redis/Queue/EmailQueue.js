const {Queue} = require("bullmq")
const redisConnection = require("../Config/RedisConfig")

const emailQueue = new Queue("email-queue", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3, // number of retry attempts if the job fails
        backoff: {
            type: "exponential", // exponential backoff for retries, formula: delay = baseDelay * (2 ^ attemptNumber - 1)
            delay: 2000 // delay in milliseconds before retrying
        },
        removeOnComplete: true, // if job is completed then remove it from the Queue
        removeOnFail: false     // if job fails then debug it and do not remove it from the Queue
    }
})

// addEmaiJob function :- add a job to the email queue
const addEmailJob = async(to, subject, text, options = {}) => {
    try {
        const job = await emailQueue.add("send-email", {to,subject,text,options})

        console.log(`addEmailJob with ID: ${job.id}`);
        return job.id;
    } catch (error) {
        console.log(`Error while addEmailJob: ${error.message}`);
        throw error;
    }
}

module.exports = { 
    emailQueue, 
    addEmailJob
}