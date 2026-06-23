// Auto-generated SDK for BlogPost entity

class BlogPostEntity {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.blog_idea_id = data.blog_idea_id || "";
    this.title = data.title || "";
    this.content = data.content || "";
    this.excerpt = data.excerpt || "";
    this.hero_image_url = data.hero_image_url || "";
    this.hero_image_alt = data.hero_image_alt || "";
    this.variation_number = data.variation_number || 1;
    this.status = data.status || "draft";
    this.wordpress_post_id = data.wordpress_post_id || "";
    this.wordpress_site_id = data.wordpress_site_id || "";
    this.published_at = data.published_at || null;
    this.seo_title = data.seo_title || "";
    this.meta_description = data.meta_description || "";
    this.tags = data.tags || [];
    this.word_count = data.word_count || 0;
    this.created_date = data.created_date || new Date().toISOString();
    this.updated_date = data.updated_date || new Date().toISOString();
    this.user_id = data.user_id || "user_1";
  }

  generateId() {
    return "post_" + Math.random().toString(36).substr(2, 9);
  }

  // Static methods for CRUD operations
  static async list(sort = "-created_date", limit = 50) {
    const stored = localStorage.getItem("blogPosts");
    let posts = stored
      ? JSON.parse(stored).map((data) => new BlogPostEntity(data))
      : [];

    // Apply sorting
    if (sort.startsWith("-")) {
      const field = sort.substring(1);
      if (field === "created_date" || field === "updated_date") {
        posts.sort((a, b) => new Date(b[field]) - new Date(a[field]));
      } else {
        posts.sort((a, b) => (b[field] || "").localeCompare(a[field] || ""));
      }
    } else {
      if (sort === "created_date" || sort === "updated_date") {
        posts.sort((a, b) => new Date(a[sort]) - new Date(b[sort]));
      } else {
        posts.sort((a, b) => (a[sort] || "").localeCompare(b[sort] || ""));
      }
    }

    return posts.slice(0, limit);
  }

  static async get(id) {
    const all = await this.list(null, 1000);
    return all.find((post) => post.id === id) || null;
  }

  static async create(data) {
    const post = new BlogPostEntity(data);
    await post.save();
    return post;
  }

  static async findByIdeaId(ideaId) {
    const all = await this.list(null, 1000);
    return all.filter((post) => post.blog_idea_id === ideaId);
  }

  async save() {
    const all = await BlogPostEntity.list(null, 1000);
    const index = all.findIndex((post) => post.id === this.id);
    this.updated_date = new Date().toISOString();

    if (index >= 0) {
      all[index] = this;
    } else {
      all.push(this);
    }

    localStorage.setItem("blogPosts", JSON.stringify(all));
    return this;
  }

  async delete() {
    const all = await BlogPostEntity.list(null, 1000);
    const filtered = all.filter((post) => post.id !== this.id);
    localStorage.setItem("blogPosts", JSON.stringify(filtered));
    return true;
  }

  async update(data) {
    Object.assign(this, data);
    this.updated_date = new Date().toISOString();
    return await this.save();
  }
}

export const BlogPost = BlogPostEntity;
export default BlogPostEntity;
