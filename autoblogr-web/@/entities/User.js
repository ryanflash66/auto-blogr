// Mock User entity (normally built-in + User.json schema)

class UserEntity {
  constructor(data = {}) {
    this.id = data.id || "user_1";
    this.email = data.email || "demo@autoblogr.com";
    this.name = data.name || "Demo User";
    this.business_name = data.business_name || "";
    this.brand_voice = data.brand_voice || "";
    this.default_tone = data.default_tone || "professional";
    this.default_target_audience = data.default_target_audience || "";
    this.content_preferences = data.content_preferences || "";
    this.created_date = data.created_date || new Date().toISOString();
    this.updated_date = data.updated_date || new Date().toISOString();
  }

  static async me() {
    const stored = localStorage.getItem("currentUser");
    return stored ? new UserEntity(JSON.parse(stored)) : new UserEntity();
  }

  static async get(id) {
    if (id === "user_1" || !id) {
      return await this.me();
    }
    return null;
  }

  async save() {
    this.updated_date = new Date().toISOString();
    localStorage.setItem("currentUser", JSON.stringify(this));
    return this;
  }

  async update(data) {
    Object.assign(this, data);
    return await this.save();
  }
}

export const User = UserEntity;
export default UserEntity;
