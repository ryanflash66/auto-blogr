// User Entity - Minimal stub
export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || "";
    this.name = data.name || "";
  }
}

export default User;
