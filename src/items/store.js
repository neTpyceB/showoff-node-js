export function createItemStore() {
  const items = [];
  let nextId = 1;

  return {
    list() {
      return items;
    },
    get(id) {
      return items.find((item) => item.id === id) ?? null;
    },
    create(name) {
      const item = { id: nextId, name };

      nextId += 1;
      items.push(item);

      return item;
    },
    update(id, name) {
      const item = items.find((entry) => entry.id === id);

      if (!item) {
        return null;
      }

      item.name = name;
      return item;
    },
    remove(id) {
      const index = items.findIndex((item) => item.id === id);

      if (index === -1) {
        return false;
      }

      items.splice(index, 1);
      return true;
    }
  };
}
