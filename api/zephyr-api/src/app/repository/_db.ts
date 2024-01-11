import { env } from '../env';
import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: env.pg_url,
  ssl: { rejectUnauthorized: false },
});

export { client };
