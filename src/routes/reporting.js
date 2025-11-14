const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET /stats - Reporting endpoint
router.get("/stats", async (req, res) => {
    try {
        const { site_id, date } = req.query;

        // Validate site_id
        if (!site_id) {
            return res.status(400).json({
                success: false,
                error: "site_id query parameter is required",
            });
        }

        // Build date filter
        let dateFilter = {};
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            dateFilter = {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate,
                },
            };
        }

        const matchFilter = { site_id, ...dateFilter };

        // Aggregation pipeline for analytics
        const stats = await Event.aggregate([
            { $match: matchFilter },
            {
                $facet: {
                    // Total views count
                    totalViews: [{ $count: "count" }],

                    // Unique users count
                    uniqueUsers: [
                        { $group: { _id: "$user_id" } },
                        { $count: "count" },
                    ],

                    // Top paths by views
                    topPaths: [
                        {
                            $group: {
                                _id: "$path",
                                views: { $sum: 1 },
                            },
                        },
                        { $sort: { views: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                _id: 0,
                                path: "$_id",
                                views: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        // Extract results
        const totalViews = stats[0].totalViews[0]?.count || 0;
        const uniqueUsers = stats[0].uniqueUsers[0]?.count || 0;
        const topPaths = stats[0].topPaths || [];

        // Format response as per requirements
        const response = {
            site_id,
            date: date || "all-time",
            total_views: totalViews,
            unique_users: uniqueUsers,
            top_paths: topPaths,
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Reporting error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});

module.exports = router;
