import { userStorage } from '@/lib/storage';

/**
 * User Service - handles user data using local storage
 */
export const User = {
  async me() {
    return userStorage.get();
  },

  async updateMyUserData(clerkId, updates) {
    return userStorage.update(updates);
  },

  async getByClerkId(clerkId) {
    return userStorage.get();
  },
};

export default User;
