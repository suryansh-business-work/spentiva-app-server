import UsageModel from './usage.models';
import UsageLogModel from '../../apis/usage-log/usage-log.models';
import mongoose from 'mongoose';
import TrackerModel from '../tracker/tracker.models';

/**
 * Usage Service - Business logic for usage tracking and statistics
 */
export class UsageService {
  /**
   * Get overall usage statistics for a user
   */
  static async getOverallUsage(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log('[Overall Usage] Fetching for user:', userId);

    // Get overall statistics
    const overallStats = await UsageModel.aggregate([
      {
        $match: { userId: userObjectId }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$totalMessages' },
          totalTokens: { $sum: '$totalTokens' },
          userMessages: { $sum: '$userMessages' },
          aiMessages: { $sum: '$aiMessages' }
        }
      }
    ]);

    // Get statistics grouped by tracker (including deleted ones)
    const byTracker = await UsageModel.aggregate([
      {
        $match: { userId: userObjectId }
      },
      {
        $group: {
          _id: '$trackerSnapshot.trackerId',
          trackerName: { $first: '$trackerSnapshot.trackerName' },
          trackerType: { $first: '$trackerSnapshot.trackerType' },
          isDeleted: { $first: '$trackerSnapshot.isDeleted' },
          deletedAt: { $first: '$trackerSnapshot.deletedAt' },
          messageCount: { $sum: '$totalMessages' },
          tokenCount: { $sum: '$totalTokens' }
        }
      },
      {
        $sort: { messageCount: -1 }
      }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$date',
          messageCount: { $sum: '$totalMessages' },
          tokenCount: { $sum: '$totalTokens' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          messageCount: 1,
          tokenCount: 1
        }
      }
    ]);

    const overall = overallStats.length > 0
      ? overallStats[0]
      : { totalMessages: 0, totalTokens: 0, userMessages: 0, aiMessages: 0 };

    return {
      overall: {
        totalMessages: overall.totalMessages || 0,
        totalTokens: overall.totalTokens || 0,
        userMessages: overall.userMessages || 0,
        aiMessages: overall.aiMessages || 0
      },
      byTracker: byTracker.map(tracker => ({
        trackerId: tracker._id,
        trackerName: tracker.trackerName,
        trackerType: tracker.trackerType,
        isDeleted: tracker.isDeleted || false,
        deletedAt: tracker.deletedAt,
        messageCount: tracker.messageCount,
        tokenCount: tracker.tokenCount
      })),
      recentActivity
    };
  }

  /**
   * Get usage statistics for a specific tracker
   */
  static async getTrackerUsage(userId: string, trackerId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log('[Tracker Usage] Fetching for:', { userId, trackerId });

    // Get tracker statistics
    const trackerStats = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          'trackerSnapshot.trackerId': trackerId
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$totalMessages' },
          totalTokens: { $sum: '$totalTokens' },
          userMessages: { $sum: '$userMessages' },
          aiMessages: { $sum: '$aiMessages' },
          trackerName: { $first: '$trackerSnapshot.trackerName' },
          trackerType: { $first: '$trackerSnapshot.trackerType' },
          isDeleted: { $first: '$trackerSnapshot.isDeleted' },
          deletedAt: { $first: '$trackerSnapshot.deletedAt' }
        }
      }
    ]);

    // If no usage data yet, try to get tracker info
    if (trackerStats.length === 0) {
      const tracker = await TrackerModel.findOne({ _id: trackerId, userId: userObjectId });
      if (!tracker) {
        throw new Error('Tracker not found');
      }

      return {
        tracker: {
          trackerId,
          trackerName: tracker.name,
          trackerType: tracker.type,
          isDeleted: false,
          deletedAt: null
        },
        usage: {
          totalMessages: 0,
          totalTokens: 0,
          userMessages: 0,
          aiMessages: 0
        },
        dailyUsage: [],
        messages: []
      };
    }

    // Get daily usage
    const dailyUsage = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          'trackerSnapshot.trackerId': trackerId
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $limit: 30
      },
      {
        $project: {
          _id: 0,
          date: 1,
          messageCount: '$totalMessages',
          tokenCount: '$totalTokens'
        }
      }
    ]);

    // Get recent messages (from UsageLog)
    const messages = await UsageLogModel.find({
      userId: userObjectId,
      'trackerSnapshot.trackerId': trackerId
    })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('messageRole messageContent tokenCount timestamp')
      .lean();

    const stats = trackerStats[0];
    return {
      tracker: {
        trackerId,
        trackerName: stats.trackerName,
        trackerType: stats.trackerType,
        isDeleted: stats.isDeleted || false,
        deletedAt: stats.deletedAt
      },
      usage: {
        totalMessages: stats.totalMessages,
        totalTokens: stats.totalTokens,
        userMessages: stats.userMessages,
        aiMessages: stats.aiMessages
      },
      dailyUsage,
      messages: messages.map(msg => ({
        _id: msg._id,
        role: msg.messageRole,
        content: msg.messageContent,
        tokenCount: msg.tokenCount,
        timestamp: msg.timestamp
      }))
    };
  }

  /**
   * Get logs for a specific tracker with pagination
   */
  static async getTrackerLogs(userId: string, trackerId: string, limit: number = 100, offset: number = 0) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log('[Tracker Logs] Fetching for:', {
      userId,
      trackerId,
      limit,
      offset
    });

    // Get total count
    const totalCount = await UsageLogModel.countDocuments({
      userId: userObjectId,
      'trackerSnapshot.trackerId': trackerId
    });

    // Get paginated logs
    const logs = await UsageLogModel.find({
      userId: userObjectId,
      'trackerSnapshot.trackerId': trackerId
    })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .select('messageRole messageContent tokenCount timestamp trackerSnapshot')
      .lean();

    return {
      totalCount,
      limit,
      offset,
      hasMore: totalCount > offset + limit,
      logs: logs.map(log => ({
        _id: log._id,
        role: log.messageRole,
        content: log.messageContent,
        tokenCount: log.tokenCount,
        timestamp: log.timestamp,
        tracker: {
          trackerId: log.trackerSnapshot.trackerId,
          trackerName: log.trackerSnapshot.trackerName,
          trackerType: log.trackerSnapshot.trackerType,
          isDeleted: log.trackerSnapshot.isDeleted || false
        }
      }))
    };
  }
}

export default UsageService;
