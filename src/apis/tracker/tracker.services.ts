import categoryModels from '../category/category.models';
import expenseModels from '../expense/expense.models';
import TrackerModel from './tracker.models';
import { logger } from '../../utils/logger';

/**
 * Tracker Service - Business logic for tracker operations
 */
class TrackerService {
  /**
   * Default categories to create with new tracker
   */
  private readonly DEFAULT_CATEGORIES = [
    {
      name: 'Food & Dining',
      subcategories: [
        { id: `${Date.now()}-1`, name: 'Groceries' },
        { id: `${Date.now()}-2`, name: 'Restaurants' },
        { id: `${Date.now()}-3`, name: 'Fast Food' },
      ],
    },
    {
      name: 'Transportation',
      subcategories: [
        { id: `${Date.now()}-4`, name: 'Fuel' },
        { id: `${Date.now()}-5`, name: 'Public Transport' },
        { id: `${Date.now()}-6`, name: 'Taxi/Uber' },
      ],
    },
    {
      name: 'Shopping',
      subcategories: [
        { id: `${Date.now()}-7`, name: 'Clothing' },
        { id: `${Date.now()}-8`, name: 'Electronics' },
        { id: `${Date.now()}-9`, name: 'Books' },
      ],
    },
    {
      name: 'Entertainment',
      subcategories: [
        { id: `${Date.now()}-10`, name: 'Movies' },
        { id: `${Date.now()}-11`, name: 'Games' },
        { id: `${Date.now()}-12`, name: 'Hobbies' },
      ],
    },
    {
      name: 'Bills & Utilities',
      subcategories: [
        { id: `${Date.now()}-13`, name: 'Electricity' },
        { id: `${Date.now()}-14`, name: 'Water' },
        { id: `${Date.now()}-15`, name: 'Internet' },
      ],
    },
  ];

  /**
   * Get all trackers for a user
   */
  async getAllTrackers(userId: string) {
    const trackers = await TrackerModel.find({ userId }).sort({ createdAt: -1 });

    return trackers.map(tracker => ({
      id: tracker._id.toString(),
      name: tracker.name,
      type: tracker.type,
      description: tracker.description,
      currency: tracker.currency,
      createdAt: tracker.createdAt,
      updatedAt: tracker.updatedAt,
    }));
  }

  /**
   * Create a new tracker with default categories
   */
  async createTracker(
    userId: string,
    data: {
      name: string;
      type: 'personal' | 'business';
      description?: string;
      currency: 'INR' | 'USD' | 'EUR' | 'GBP';
    }
  ) {
    // Validate required fields
    if (!data.name || !data.type || !data.currency) {
      throw new Error('Missing required fields: name, type, and currency are required');
    }

    // Create tracker
    const tracker = new TrackerModel({
      name: data.name,
      type: data.type,
      description: data.description,
      currency: data.currency,
      userId,
    });

    await tracker.save();

    // Create default categories for the new tracker
    const defaultCategories = this.DEFAULT_CATEGORIES.map(category => ({
      trackerId: tracker._id.toString(),
      name: category.name,
      subcategories: category.subcategories,
    }));

    await categoryModels.insertMany(defaultCategories);

    return {
      id: (tracker._id as unknown as string).toString(),
      name: tracker.name,
      type: tracker.type,
      description: tracker.description,
      currency: tracker.currency,
      createdAt: tracker.createdAt,
      updatedAt: tracker.updatedAt,
    };
  }

  /**
   * Get a single tracker by ID
   */
  async getTrackerById(userId: string, trackerId: string) {
    const tracker = await TrackerModel.findOne({ _id: trackerId, userId });

    if (!tracker) {
      throw new Error('Tracker not found');
    }

    return {
      id: tracker._id.toString(),
      name: tracker.name,
      type: tracker.type,
      description: tracker.description,
      currency: tracker.currency,
      createdAt: tracker.createdAt,
      updatedAt: tracker.updatedAt,
    };
  }

  /**
   * Update a tracker
   */
  async updateTracker(
    userId: string,
    trackerId: string,
    data: {
      name?: string;
      type?: 'personal' | 'business';
      description?: string;
      currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
    }
  ) {
    const tracker = await TrackerModel.findOneAndUpdate(
      { _id: trackerId, userId },
      { name: data.name, type: data.type, description: data.description, currency: data.currency },
      { new: true }
    );

    if (!tracker) {
      throw new Error('Tracker not found');
    }

    // Update tracker information in usage records
    if (data.name || data.type) {
      try {
        const { updateTrackerInUsage } = await import('../usage-log/usage-log.services');
        await updateTrackerInUsage(trackerId, {
          trackerName: tracker.name,
          trackerType: tracker.type,
        });
        logger.info('Updated tracker in usage records', { trackerId });
      } catch (usageError) {
        logger.error('Error updating tracker in usage', { trackerId, error: usageError });
        // Don't fail the update operation if usage update fails
      }
    }

    return {
      id: tracker._id.toString(),
      name: tracker.name,
      type: tracker.type,
      description: tracker.description,
      currency: tracker.currency,
      createdAt: tracker.createdAt,
      updatedAt: tracker.updatedAt,
    };
  }

  /**
   * Delete a tracker and all associated data
   */
  async deleteTracker(userId: string, trackerId: string) {
    const tracker = await TrackerModel.findOneAndDelete({ _id: trackerId, userId });

    if (!tracker) {
      throw new Error('Tracker not found');
    }

    // Mark tracker as deleted in usage records (so data is preserved)
    try {
      const { markTrackerAsDeleted } = await import('../usage-log/usage-log.services');
      await markTrackerAsDeleted(trackerId);
      logger.info('Marked tracker as deleted in usage records', { trackerId });
    } catch (usageError) {
      logger.error('Error marking tracker as deleted in usage', { trackerId, error: usageError });
      // Don't fail the delete operation if usage marking fails
    }

    // Delete all expenses associated with this tracker
    await expenseModels.deleteMany({ trackerId });

    // Delete all categories associated with this tracker
    await categoryModels.deleteMany({ trackerId });

    return {
      id: trackerId,
      message: 'Tracker and associated expenses deleted successfully',
    };
  }
}

export default new TrackerService();
