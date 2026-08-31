import { AZKAR_CATEGORIES, AZKAR_ITEMS, } from '../data/azkarData.js';
import { AzkarFavorite } from '../models/AzkarFavorite.js';
export class AzkarService {
    /**
     * Retrieves all Azkar categories
     */
    static getCategories() {
        return AZKAR_CATEGORIES;
    }
    /**
     * Retrieves Azkar items filtered by category or search term
     */
    static getItems(category, search) {
        let items = AZKAR_ITEMS;
        if (category && category !== 'all') {
            items = items.filter((item) => item.category === category);
        }
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            items = items.filter((item) => item.title.toLowerCase().includes(q) ||
                item.translation.toLowerCase().includes(q) ||
                item.reference.toLowerCase().includes(q) ||
                item.arabic.includes(q));
        }
        return items;
    }
    /**
     * Retrieves user favorite azkar IDs
     */
    static async getFavorites(userId) {
        const favorites = await AzkarFavorite.find({ userId });
        return favorites.map((f) => f.azkarId);
    }
    /**
     * Toggles a favorite azkar for an authenticated user
     */
    static async toggleFavorite(userId, azkarId) {
        const existing = await AzkarFavorite.findOne({ userId, azkarId });
        if (existing) {
            await AzkarFavorite.deleteOne({ _id: existing._id });
            return { isFavorited: false, azkarId };
        }
        await AzkarFavorite.create({ userId, azkarId });
        return { isFavorited: true, azkarId };
    }
}
