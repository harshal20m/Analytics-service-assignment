const express = require("express");
const router = express.Router();
const eventQueue = require("../services/eventQueue");

// POST /event - Ingestion endpoint (must be FAST)
router.post("/event", async (req, res) => {
    try {
        const { site_id, event_type, path, user_id, timestamp } = req.body;

        // Step 1: Validate required fields
        if (!site_id || !event_type) {
            return res.status(400).json({
                success: false,
                error: "site_id and event_type are required",
            });
        }

        if (!path || !user_id || !timestamp) {
            return res.status(400).json({
                success: false,
                error: "path, user_id, and timestamp are required",
            });
        }

        // Step 2: Add to queue (non-blocking, async)
        // Don't await - just fire and forget for speed
        eventQueue.add(
            {
                site_id,
                event_type,
                path,
                user_id,
                timestamp: new Date(timestamp),
            },
            {
                priority: 1,
            }
        );

        // Step 3: Immediately return success (don't wait for DB write)
        return res.status(200).json({
            success: true,
            message: "Event received",
        });
    } catch (error) {
        console.error("Ingestion error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});

module.exports = router;
