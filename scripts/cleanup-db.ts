import { Pool } from 'pg';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const client = await pool.connect();
  try {
    const res = await client.query('DELETE FROM chunks WHERE embedding_id IS NULL');
    console.log(`Deleted ${res.rowCount} old chunks without embeddings.`);
  } finally {
    client.release();
    pool.end();
  }
}

main().catch(console.error);
