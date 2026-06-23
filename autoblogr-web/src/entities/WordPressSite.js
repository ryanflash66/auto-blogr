// WordPressSite Entity - Minimal stub
export class WordPressSite {
  constructor(data = {}) {
    this.id = data.id || null;
    this.url = data.url || "";
    this.name = data.name || "";
  }
}

export default WordPressSite;
