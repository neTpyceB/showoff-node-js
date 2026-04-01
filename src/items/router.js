import express from 'express';
import { HttpError } from '../http-error.js';
import { parseItemId, parseItemName } from './validators.js';

export function createItemsRouter(store) {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json(store.list());
  });

  router.get('/:id', (req, res) => {
    const item = store.get(parseItemId(req.params.id));

    if (!item) {
      throw new HttpError(404, 'Item not found');
    }

    res.json(item);
  });

  router.post('/', (req, res) => {
    const item = store.create(parseItemName(req.body));

    res.status(201).json(item);
  });

  router.put('/:id', (req, res) => {
    const item = store.update(parseItemId(req.params.id), parseItemName(req.body));

    if (!item) {
      throw new HttpError(404, 'Item not found');
    }

    res.json(item);
  });

  router.delete('/:id', (req, res) => {
    const removed = store.remove(parseItemId(req.params.id));

    if (!removed) {
      throw new HttpError(404, 'Item not found');
    }

    res.status(204).end();
  });

  return router;
}
