"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usageController_1 = require("../controllers/usageController");
const auth_1 = require("../middleware/auth");
const Message_1 = __importDefault(require("../models/Message"));
const router = express_1.default.Router();
// Get overall usage statistics
router.get('/overall', auth_1.authenticate, usageController_1.getOverallUsage);
// Get usage for a specific tracker
router.get('/tracker/:trackerId', auth_1.authenticate, usageController_1.getTrackerUsage);
// Get logs for a specific tracker
router.get('/tracker/:trackerId/logs', auth_1.authenticate, usageController_1.getTrackerLogs);
// Debug endpoint to check messages in database
router.get('/debug/messages', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const messages = await Message_1.default.find({ userId }).limit(10).sort({ timestamp: -1 });
        const count = await Message_1.default.countDocuments({ userId });
        res.json({
            count,
            messages: messages.map(m => ({
                id: m._id,
                trackerId: m.trackerId,
                role: m.role,
                tokenCount: m.tokenCount,
                timestamp: m.timestamp,
                content: m.content.substring(0, 50)
            }))
        });
    }
    catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
