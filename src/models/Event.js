const mongoose = require("mongoose");

// Schema for raw events
const eventSchema = new mongoose.Schema({
    site_id: {
        type: String,
        required: true,
        index: true,
    },
    event_type: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        index: true,
    },
    processed_at: {
        type: Date,
        default: Date.now,
    },
});

// Compound index for efficient querying
eventSchema.index({ site_id: 1, timestamp: 1 });
eventSchema.index({ site_id: 1, user_id: 1 });

module.exports = mongoose.model("Event", eventSchema);
