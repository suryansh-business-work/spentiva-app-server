import UsageLogModel from './usage-log.models';
import mongoose from 'mongoose';

/**
 * UsageLog Service - Business logic for usage logging
 */
export class UsageLogService {
  /**
   * Get all usage logs with optional filtering
   */
  static async getAllLogs(filters: { userId?: string; trackerId?: string; limit?: number }) {
    const { userId, trackerId, limit = 100 } = filters;
    const query: any = {};

    if (userId) query.userId = new mongoose.Types.ObjectId(userId);
    if (trackerId) query['trackerSnapshot.trackerId'] = trackerId;

    const logs = await UsageLogModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return logs;
  }

  /**
   * Create a new usage log
   */
  static async createLog(data: {
    userId: string;
    trackerSnapshot: {
      trackerId: string;
      trackerName: string;
      trackerType: string;
      isDeleted?: boolean;
      deletedAt?: Date;
      modifiedAt?: Date;
    };
    messageRole: 'user' | 'assistant';
    messageContent: string;
    tokenCount: number;
    timestamp?: Date;
  }) {
    const { userId, trackerSnapshot, messageRole, messageContent, tokenCount, timestamp } = data;

    if (!userId || !trackerSnapshot || !messageRole || !messageContent) {
      throw new Error('Missing required fields: userId, trackerSnapshot, messageRole, messageContent');
    }

    const log = await UsageLogModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      trackerSnapshot,
      messageRole,
      messageContent,
      tokenCount: tokenCount || 0,
      timestamp: timestamp || new Date()
    });

    return log;
  }

  /**
   * Delete old logs (for cleanup/maintenance)
   */
  static async deleteOldLogs(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await UsageLogModel.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return {
      message: `Deleted ${result.deletedCount} logs older than ${daysOld} days`,
      deletedCount: result.deletedCount
    };
  }
}

/**
 * Helper function to create a tracker snapshot
 */
export function createTrackerSnapshot(tracker: any) {
  return {
    trackerId: tracker._id.toString(),
    trackerName: tracker.name,
    trackerType: tracker.type || 'default',
    isDeleted: tracker.isDeleted || false,
    deletedAt: tracker.deletedAt,
    modifiedAt: tracker.updatedAt
  };
}

/**
 * Helper function to log usage with tracker snapshot
 */
export async function logUsage(
  userId: string,
  trackerSnapshot: {
    trackerId: string;
    trackerName: string;
    trackerType: string;
    isDeleted?: boolean;
    deletedAt?: Date;
    modifiedAt?: Date;
  },
  messageRole: 'user' | 'assistant',
  messageContent: string,
  tokenCount: number
) {
  try {
    await UsageLogService.createLog({
      userId,
      trackerSnapshot,
      messageRole,
      messageContent,
      tokenCount
    });
  } catch (error) {
    console.error('[UsageLogger] Error logging usage:', error);
    throw error;
  }
}

/**
 * Update tracker information in existing usage logs
 */
export async function updateTrackerInUsage(
  trackerId: string,
  updates: {
    trackerName?: string;
    trackerType?: string;
  }
) {
  try {
    const updateFields: any = {
      'trackerSnapshot.modifiedAt': new Date()
    };

    if (updates.trackerName) {
      updateFields['trackerSnapshot.trackerName'] = updates.trackerName;
    }
    if (updates.trackerType) {
      updateFields['trackerSnapshot.trackerType'] = updates.trackerType;
    }

    await UsageLogModel.updateMany(
      { 'trackerSnapshot.trackerId': trackerId },
      { $set: updateFields }
    );
  } catch (error) {
    console.error('[UsageLogger] Error updating tracker in usage logs:', error);
    throw error;
  }
}

/**
 * Mark tracker as deleted in usage logs
 */
export async function markTrackerAsDeleted(trackerId: string) {
  try {
    await UsageLogModel.updateMany(
      { 'trackerSnapshot.trackerId': trackerId },
      {
        $set: {
          'trackerSnapshot.isDeleted': true,
          'trackerSnapshot.deletedAt': new Date()
        }
      }
    );
  } catch (error) {
    console.error('[UsageLogger] Error marking tracker as deleted:', error);
    throw error;
  }
}

export default UsageLogService;
