const Queue = require("bull");
require("dotenv").config();

const eventQueue = new Queue("analytics-events", {
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

eventQueue.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

eventQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});

eventQueue.on("error", (error) => {
    console.error("Queue error:", error);
});

module.exports = eventQueue;
