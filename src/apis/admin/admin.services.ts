import { UserModel } from '../auth/auth.models';

/**
 * Admin Service - Business logic for admin operations
 */
export class AdminService {
  /**
   * Get user statistics with optional date filters
   */
  static async getUsersStatistics(filter?: string, startDate?: string, endDate?: string) {
    // Build date filter query
    let dateFilter: any = {};

    if (filter) {
      const now = new Date();
      let filterDate: Date;

      switch (filter) {
        case 'today':
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = { createdAt: { $gte: filterDate } };
          break;

        case 'yesterday':
          const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = { createdAt: { $gte: yesterday, $lt: todayStart } };
          break;

        case 'last7days':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { $gte: filterDate } };
          break;

        case 'month':
          filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { createdAt: { $gte: filterDate } };
          break;

        case 'year':
          filterDate = new Date(now.getFullYear(), 0, 1);
          dateFilter = { createdAt: { $gte: filterDate } };
          break;

        case 'custom':
          if (startDate && endDate) {
            dateFilter = {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            };
          }
          break;
      }
    }

    // Get counts
    const totalUsers = await UserModel.countDocuments(dateFilter);
    const proUsers = await UserModel.countDocuments({ ...dateFilter, accountType: 'pro' });
    const businessProUsers = await UserModel.countDocuments({
      ...dateFilter,
      accountType: 'businesspro',
    });
    const freeUsers = await UserModel.countDocuments({ ...dateFilter, accountType: 'free' });

    // Get total counts (without date filter)
    const allTimeTotal = await UserModel.countDocuments();
    const allTimePro = await UserModel.countDocuments({ accountType: 'pro' });
    const allTimeBusinessPro = await UserModel.countDocuments({ accountType: 'businesspro' });
    const allTimeFree = await UserModel.countDocuments({ accountType: 'free' });

    return {
      filtered: {
        total: totalUsers,
        free: freeUsers,
        pro: proUsers,
        businesspro: businessProUsers,
      },
      allTime: {
        total: allTimeTotal,
        free: allTimeFree,
        pro: allTimePro,
        businesspro: allTimeBusinessPro,
      },
      filter: filter || 'none',
      dateRange: filter === 'custom' ? { startDate, endDate } : null,
    };
  }

  /**
   * Get all users with pagination and filters
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: 'user' | 'admin';
      accountType?: 'free' | 'pro' | 'businesspro';
      emailVerified?: boolean;
    }
  ) {
    const skip = (page - 1) * limit;

    // Build filter query
    const query: any = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.accountType) query.accountType = filters.accountType;
    if (filters?.emailVerified !== undefined) query.emailVerified = filters.emailVerified;

    // Get users
    const users = await UserModel.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserModel.countDocuments(query);

    return {
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountType: user.accountType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select(
      '-password -resetPasswordToken -resetPasswordExpires'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        profilePhotoFileId: user.profilePhotoFileId,
        role: user.role,
        accountType: user.accountType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Update user role or account type
   */
  static async updateUser(
    userId: string,
    updates: {
      role?: 'user' | 'admin';
      accountType?: 'free' | 'pro' | 'businesspro';
      name?: string;
      email?: string;
    }
  ) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update only fields that are explicitly provided
    if (updates.role !== undefined) {
      user.role = updates.role;
    }

    if (updates.accountType !== undefined) {
      user.accountType = updates.accountType;
    }

    if (updates.name !== undefined) {
      user.name = updates.name;
    }

    if (updates.email !== undefined) {
      // Check if email is already taken
      const existingUser = await UserModel.findOne({ email: updates.email });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('Email already in use');
      }
      user.email = updates.email;
      user.emailVerified = false; // Reset verification if email changes
    }

    await user.save();

    return {
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountType: user.accountType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Delete user
    await UserModel.findByIdAndDelete(userId);

    // TODO: Cascade delete user's data (trackers, expenses, etc.)
    // This should be implemented based on your data structure

    return {
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}

export default AdminService;
