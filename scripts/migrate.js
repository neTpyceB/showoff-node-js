import { migrateDatabase } from '../src/store.js';

migrateDatabase(process.env.DATABASE_PATH ?? 'tmp/chat.sqlite');
process.stdout.write('Migrations applied\n');
