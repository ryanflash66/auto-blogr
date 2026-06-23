// Auto-generated SDK for WordPressSite entity

class WordPressSiteEntity {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || "";
    this.url = data.url || "";
    this.api_key = data.api_key || "";
    this.username = data.username || "";
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.connection_status = data.connection_status || "disconnected";
    this.last_tested = data.last_tested || null;
    this.default_category = data.default_category || "";
    this.default_author = data.default_author || "";
    this.created_date = data.created_date || new Date().toISOString();
    this.updated_date = data.updated_date || new Date().toISOString();
    this.user_id = data.user_id || "user_1";
  }

  generateId() {
    return "site_" + Math.random().toString(36).substr(2, 9);
  }

  // Static methods for CRUD operations
  static async list(sort = "-created_date", limit = 50) {
    const stored = localStorage.getItem("wordPressSites");
    let sites = stored
      ? JSON.parse(stored).map((data) => new WordPressSiteEntity(data))
      : [];

    // Apply sorting
    if (sort.startsWith("-")) {
      const field = sort.substring(1);
      if (field === "created_date" || field === "updated_date") {
        sites.sort((a, b) => new Date(b[field]) - new Date(a[field]));
      } else {
        sites.sort((a, b) => (b[field] || "").localeCompare(a[field] || ""));
      }
    } else {
      if (sort === "created_date" || sort === "updated_date") {
        sites.sort((a, b) => new Date(a[sort]) - new Date(b[sort]));
      } else {
        sites.sort((a, b) => (a[sort] || "").localeCompare(b[sort] || ""));
      }
    }

    return sites.slice(0, limit);
  }

  static async get(id) {
    const all = await this.list(null, 1000);
    return all.find((site) => site.id === id) || null;
  }

  static async create(data) {
    const site = new WordPressSiteEntity(data);
    await site.save();
    return site;
  }

  async save() {
    const all = await WordPressSiteEntity.list(null, 1000);
    const index = all.findIndex((site) => site.id === this.id);
    this.updated_date = new Date().toISOString();

    if (index >= 0) {
      all[index] = this;
    } else {
      all.push(this);
    }

    localStorage.setItem("wordPressSites", JSON.stringify(all));
    return this;
  }

  async delete() {
    const all = await WordPressSiteEntity.list(null, 1000);
    const filtered = all.filter((site) => site.id !== this.id);
    localStorage.setItem("wordPressSites", JSON.stringify(filtered));
    return true;
  }

  async update(data) {
    Object.assign(this, data);
    this.updated_date = new Date().toISOString();
    return await this.save();
  }

  async testConnection() {
    // Mock connection test
    console.log(`Testing connection to ${this.url}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = Math.random() > 0.3; // 70% success rate for demo
    this.connection_status = success ? "connected" : "error";
    this.last_tested = new Date().toISOString();
    await this.save();

    return {
      success,
      message: success
        ? "Connection successful"
        : "Connection failed - please check credentials",
    };
  }
}

export const WordPressSite = WordPressSiteEntity;
export default WordPressSiteEntity;
