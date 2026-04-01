export function createUserStore() {
  const users = [];
  let nextId = 1;

  return {
    create({ email, passwordHash, role }) {
      const user = { id: nextId, email, passwordHash, role };

      nextId += 1;
      users.push(user);

      return user;
    },
    findByEmail(email) {
      return users.find((user) => user.email === email) ?? null;
    },
    findById(id) {
      return users.find((user) => user.id === id) ?? null;
    }
  };
}
