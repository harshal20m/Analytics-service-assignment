const mongoose = require("mongoose");
const eventQueue = require("./services/eventQueue");
const Event = require("./models/Event");
require("dotenv").config();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Worker: MongoDB connected"))
    .catch((err) => console.error("Worker: MongoDB connection error:", err));

// Process jobs from the queue
eventQueue.process(async (job) => {
    const { site_id, event_type, path, user_id, timestamp } = job.data;

    console.log(`Processing event: ${event_type} for site: ${site_id}`);

    try {
        // Step 1: Pull event from queue (automatic via Bull)
        // Step 2: Process the event (validation already done)
        // Step 3: Write to database
        const event = new Event({
            site_id,
            event_type,
            path,
            user_id,
            timestamp: new Date(timestamp),
            processed_at: new Date(),
        });
        await event.save();

        console.log(`Event saved to DB: ${event._id}`);
        return { success: true, eventId: event._id };
    } catch (error) {
        console.error("Error processing event:", error);
        throw error; // Bull will retry based on attempts config
    }
});

console.log("Worker started - listening for events in queue...");

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("Worker shutting down...");
    await eventQueue.close();
    await mongoose.connection.close();
    process.exit(0);
});
