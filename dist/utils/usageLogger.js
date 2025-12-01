"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrackerSnapshot = createTrackerSnapshot;
exports.logUsage = logUsage;
exports.markTrackerAsDeleted = markTrackerAsDeleted;
exports.updateTrackerInUsage = updateTrackerInUsage;
const mongoose_1 = __importDefault(require("mongoose"));
const Usage_1 = __importDefault(require("../models/Usage"));
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
/**
 * Create tracker snapshot from tracker data
 */
function createTrackerSnapshot(tracker) {
    return {
        trackerId: tracker._id.toString(),
        trackerName: tracker.name,
        trackerType: tracker.type,
        isDeleted: false,
        modifiedAt: new Date()
    };
}
/**
 * Log a message to both Usage (daily summary) and UsageLog (detailed log)
 */
async function logUsage(userId, trackerSnapshot, messageRole, messageContent, tokenCount) {
    try {
        console.log('📝 [logUsage] Starting...', {
            userId: userId.toString(),
            trackerId: trackerSnapshot.trackerId,
            trackerName: trackerSnapshot.trackerName,
            messageRole,
            tokenCount,
            contentLength: messageContent.length
        });
        const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day
        // 1. Create detailed log entry
        console.log('📝 [logUsage] Creating UsageLog entry...');
        const logEntry = await UsageLog_1.default.create({
            userId: userObjectId,
            trackerSnapshot,
            messageRole,
            messageContent,
            tokenCount,
            timestamp: new Date()
        });
        console.log('✅ [logUsage] UsageLog entry created:', logEntry._id);
        // 2. Update or create daily usage summary
        console.log('📝 [logUsage] Updating Usage summary...');
        const updateFields = {
            $inc: {
                totalMessages: 1,
                totalTokens: tokenCount,
                ...(messageRole === 'user' ? { userMessages: 1 } : { aiMessages: 1 })
            },
            $setOnInsert: {
                userId: userObjectId,
                date: today,
                trackerSnapshot
            }
        };
        const usageDoc = await Usage_1.default.findOneAndUpdate({
            userId: userObjectId,
            date: today,
            'trackerSnapshot.trackerId': trackerSnapshot.trackerId
        }, updateFields, { upsert: true, new: true });
        console.log('✅ [logUsage] Usage summary updated:', usageDoc._id);
        console.log(`✅ Logged usage for tracker: ${trackerSnapshot.trackerName}`);
    }
    catch (error) {
        console.error('❌ Error logging usage:', error);
        throw error;
    }
}
/**
 * Mark tracker as deleted in all usage records
 * This should be called when a tracker is deleted
 */
async function markTrackerAsDeleted(trackerId) {
    try {
        const deletedAt = new Date();
        // Update Usage records
        await Usage_1.default.updateMany({ 'trackerSnapshot.trackerId': trackerId }, {
            $set: {
                'trackerSnapshot.isDeleted': true,
                'trackerSnapshot.deletedAt': deletedAt
            }
        });
        // Update UsageLog records
        await UsageLog_1.default.updateMany({ 'trackerSnapshot.trackerId': trackerId }, {
            $set: {
                'trackerSnapshot.isDeleted': true,
                'trackerSnapshot.deletedAt': deletedAt
            }
        });
        console.log(`✅ Marked tracker ${trackerId} as deleted in usage records`);
    }
    catch (error) {
        console.error('❌ Error marking tracker as deleted:', error);
        throw error;
    }
}
/**
 * Update tracker information in all usage records
 * This should be called when a tracker is renamed or modified
 */
async function updateTrackerInUsage(trackerId, newName, newType) {
    try {
        const modifiedAt = new Date();
        // Update Usage records
        await Usage_1.default.updateMany({ 'trackerSnapshot.trackerId': trackerId }, {
            $set: {
                'trackerSnapshot.trackerName': newName,
                'trackerSnapshot.trackerType': newType,
                'trackerSnapshot.modifiedAt': modifiedAt
            }
        });
        // Update UsageLog records
        await UsageLog_1.default.updateMany({ 'trackerSnapshot.trackerId': trackerId }, {
            $set: {
                'trackerSnapshot.trackerName': newName,
                'trackerSnapshot.trackerType': newType,
                'trackerSnapshot.modifiedAt': modifiedAt
            }
        });
        console.log(`✅ Updated tracker ${trackerId} information in usage records`);
    }
    catch (error) {
        console.error('❌ Error updating tracker in usage:', error);
        throw error;
    }
}
