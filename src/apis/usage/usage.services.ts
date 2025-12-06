import UsageModel from './usage.models';
import UsageLogService from '../../apis/usage-log/usage-log.services';
import mongoose from 'mongoose';
import TrackerModel from '../tracker/tracker.models';
import { logger } from '../../utils/logger';

/**
 * Usage Service - Business logic for usage tracking and statistics
 */
export class UsageService {
  /**
   * Get overall usage statistics for a user
   */
  static async getOverallUsage(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    logger.info('Fetching overall usage', { userId });

    // Get overall statistics
    const overallStats = await UsageModel.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$totalMessages' },
          totalTokens: { $sum: '$totalTokens' },
          userMessages: { $sum: '$userMessages' },
          aiMessages: { $sum: '$aiMessages' },
        },
      },
    ]);

    // Get statistics grouped by tracker (including deleted ones)
    const byTracker = await UsageModel.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: '$trackerSnapshot.trackerId',
          trackerName: { $first: '$trackerSnapshot.trackerName' },
          trackerType: { $first: '$trackerSnapshot.trackerType' },
          isDeleted: { $first: '$trackerSnapshot.isDeleted' },
          deletedAt: { $first: '$trackerSnapshot.deletedAt' },
          messageCount: { $sum: '$totalMessages' },
          tokenCount: { $sum: '$totalTokens' },
        },
      },
      {
        $sort: { messageCount: -1 },
      },
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$date',
          messageCount: { $sum: '$totalMessages' },
          tokenCount: { $sum: '$totalTokens' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          messageCount: 1,
          tokenCount: 1,
        },
      },
    ]);

    const overall =
      overallStats.length > 0
        ? overallStats[0]
        : { totalMessages: 0, totalTokens: 0, userMessages: 0, aiMessages: 0 };

    return {
      overall: {
        totalMessages: overall.totalMessages || 0,
        totalTokens: overall.totalTokens || 0,
        userMessages: overall.userMessages || 0,
        aiMessages: overall.aiMessages || 0,
      },
      byTracker: byTracker.map(tracker => ({
        trackerId: tracker._id,
        trackerName: tracker.trackerName,
        trackerType: tracker.trackerType,
        isDeleted: tracker.isDeleted || false,
        deletedAt: tracker.deletedAt,
        messageCount: tracker.messageCount,
        tokenCount: tracker.tokenCount,
      })),
      recentActivity,
    };
  }

  /**
   * Get usage statistics for a specific tracker
   */
  static async getTrackerUsage(userId: string, trackerId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    logger.info('Fetching tracker usage', { userId, trackerId });

    // Get tracker statistics
    const trackerStats = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          'trackerSnapshot.trackerId': trackerId,
        },
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
          deletedAt: { $first: '$trackerSnapshot.deletedAt' },
        },
      },
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
          deletedAt: null,
        },
        usage: {
          totalMessages: 0,
          totalTokens: 0,
          userMessages: 0,
          aiMessages: 0,
        },
        dailyUsage: [],
        messages: [],
      };
    }

    // Get daily usage
    const dailyUsage = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          'trackerSnapshot.trackerId': trackerId,
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $limit: 30,
      },
      {
        $project: {
          _id: 0,
          date: 1,
          messageCount: '$totalMessages',
          tokenCount: '$totalTokens',
        },
      },
    ]);

    // Get recent messages (from UsageLog service)
    const messages = await UsageLogService.getRecentMessagesForTracker(userId, trackerId, 100);

    const stats = trackerStats[0];
    return {
      tracker: {
        trackerId,
        trackerName: stats.trackerName,
        trackerType: stats.trackerType,
        isDeleted: stats.isDeleted || false,
        deletedAt: stats.deletedAt,
      },
      usage: {
        totalMessages: stats.totalMessages,
        totalTokens: stats.totalTokens,
        userMessages: stats.userMessages,
        aiMessages: stats.aiMessages,
      },
      dailyUsage,
      messages,
    };
  }

  /**
   * Get logs for a specific tracker with pagination
   */
  static async getTrackerLogs(
    userId: string,
    trackerId: string,
    limit: number = 100,
    offset: number = 0
  ) {
    logger.info('Delegating to UsageLogService for tracker logs', {
      userId,
      trackerId,
      limit,
      offset,
    });

    // Delegate to UsageLogService for proper service layering
    return await UsageLogService.getTrackerLogsPaginated(userId, trackerId, limit, offset);
  }

  /**
   * Get overall usage graphs for a user (last 30 days)
   */
  static async getOverallGraphs(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    logger.info('Fetching overall graphs', { userId });

    // Daily usage over last 30 days
    const dailyUsage = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$date',
          messages: { $sum: '$totalMessages' },
          tokens: { $sum: '$totalTokens' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          label: { $dateToString: { format: '%Y-%m-%d', date: '$_id' } },
          messages: 1,
          tokens: 1,
        },
      },
    ]);

    // Usage by tracker type
    const byTrackerType = await UsageModel.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: '$trackerSnapshot.trackerType',
          count: { $sum: '$totalMessages' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
        },
      },
    ]);

    // Calculate percentages
    const totalMessages = byTrackerType.reduce((sum, item) => sum + item.count, 0);
    const byTrackerTypeWithPercentage = byTrackerType.map(item => ({
      category: item.category || 'Unknown',
      count: item.count,
      percentage: totalMessages > 0 ? Math.round((item.count / totalMessages) * 100) : 0,
    }));

    return {
      dailyUsage,
      byTrackerType: byTrackerTypeWithPercentage,
    };
  }

  /**
   * Get tracker-specific usage graphs
   */
  static async getTrackerGraphs(userId: string, trackerId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    logger.info('Fetching tracker graphs', { userId, trackerId });

    // Daily usage for this tracker (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUsage = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          'trackerSnapshot.trackerId': trackerId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$date',
          messages: { $sum: '$totalMessages' },
          tokens: { $sum: '$totalTokens' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          label: { $dateToString: { format: '%Y-%m-%d', date: '$_id' } },
          messages: 1,
          tokens: 1,
        },
      },
    ]);

    // Message type distribution (user vs AI)
    const messageDistribution = await UsageModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          'trackerSnapshot.trackerId': trackerId,
        },
      },
      {
        $group: {
          _id: null,
          userMessages: { $sum: '$userMessages' },
          aiMessages: { $sum: '$aiMessages' },
        },
      },
    ]);

    const distribution = messageDistribution[0] || { userMessages: 0, aiMessages: 0 };
    const totalMessages = distribution.userMessages + distribution.aiMessages;

    const messageTypeDistribution = [
      {
        category: 'User Messages',
        count: distribution.userMessages,
        percentage:
          totalMessages > 0 ? Math.round((distribution.userMessages / totalMessages) * 100) : 0,
      },
      {
        category: 'AI Messages',
        count: distribution.aiMessages,
        percentage:
          totalMessages > 0 ? Math.round((distribution.aiMessages / totalMessages) * 100) : 0,
      },
    ];

    return {
      dailyUsage,
      messageTypeDistribution,
    };
  }

  /**
   * Update daily usage statistics
   */
  static async updateDailyUsage(
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
    tokenCount: number,
    timestamp: Date
  ) {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);

    const update: any = {
      $inc: {
        totalMessages: 1,
        totalTokens: tokenCount,
      },
      $set: {
        trackerSnapshot, // Update snapshot in case it changed
      },
    };

    if (messageRole === 'user') {
      update.$inc.userMessages = 1;
    } else {
      update.$inc.aiMessages = 1;
    }

    await UsageModel.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        date: date,
        'trackerSnapshot.trackerId': trackerSnapshot.trackerId,
      },
      update,
      { upsert: true, new: true }
    );
  }
}

export default UsageService;
