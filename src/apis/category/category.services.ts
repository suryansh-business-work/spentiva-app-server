import CategoryModel from './category.models';

/**
 * Category Service - Business logic for categories
 */
export class CategoryService {
  /**
   * Get all categories with their subcategories
   */
  static async getAllCategories(_userId?: string) {
    const query = _userId ? { trackerId: _userId } : {}; // Assuming _userId is intended to replace trackerId
    const categories = await CategoryModel.find(query).sort({ createdAt: -1 });
    return categories;
  }

  /**
   * Get a specific category by ID
   */
  static async getCategoryById(categoryId: string) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  /**
   * Create a new category
   */
  static async createCategory(trackerId: string, name: string, subcategories: any[]) {
    const category = await CategoryModel.create({
      trackerId,
      name,
      subcategories,
    });
    return category;
  }

  /**
   * Update a category
   */
  static async updateCategory(
    categoryId: string,
    updates: { name?: string; subcategories?: any[] }
  ) {
    const category = await CategoryModel.findByIdAndUpdate(categoryId, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: string) {
    const category = await CategoryModel.findByIdAndDelete(categoryId);

    if (!category) {
      throw new Error('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }
}

export default CategoryService;
