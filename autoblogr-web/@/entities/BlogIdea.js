// Auto-generated SDK for BlogIdea entity

class BlogIdeaEntity {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || "";
    this.description = data.description || "";
    this.variations_requested = data.variations_requested || 1;
    this.target_audience = data.target_audience || "";
    this.tone = data.tone || "professional";
    this.status = data.status || "draft";
    this.keywords = data.keywords || [];
    this.created_date = data.created_date || new Date().toISOString();
    this.updated_date = data.updated_date || new Date().toISOString();
    this.user_id = data.user_id || "user_1";
  }

  generateId() {
    return "idea_" + Math.random().toString(36).substr(2, 9);
  }

  // Static methods for CRUD operations
  static async list(sort = "-created_date", limit = 50) {
    const stored = localStorage.getItem("blogIdeas");
    let ideas = stored
      ? JSON.parse(stored).map((data) => new BlogIdeaEntity(data))
      : [];

    // Apply sorting
    if (sort.startsWith("-")) {
      const field = sort.substring(1);
      ideas.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    } else {
      ideas.sort((a, b) => new Date(a[sort]) - new Date(b[sort]));
    }

    return ideas.slice(0, limit);
  }

  static async get(id) {
    const all = await this.list();
    return all.find((idea) => idea.id === id) || null;
  }

  static async create(data) {
    const idea = new BlogIdeaEntity(data);
    await idea.save();
    return idea;
  }

  async save() {
    const all = await BlogIdeaEntity.list(null, 1000);
    const index = all.findIndex((idea) => idea.id === this.id);
    this.updated_date = new Date().toISOString();

    if (index >= 0) {
      all[index] = this;
    } else {
      all.push(this);
    }

    localStorage.setItem("blogIdeas", JSON.stringify(all));
    return this;
  }

  async delete() {
    const all = await BlogIdeaEntity.list(null, 1000);
    const filtered = all.filter((idea) => idea.id !== this.id);
    localStorage.setItem("blogIdeas", JSON.stringify(filtered));
    return true;
  }

  async update(data) {
    Object.assign(this, data);
    this.updated_date = new Date().toISOString();
    return await this.save();
  }
}

export const BlogIdea = BlogIdeaEntity;
export default BlogIdeaEntity;
