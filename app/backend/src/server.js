const http = require('http');
const { Client } = require('pg');

const PORT = Number(process.env.PORT || 8080);
const DB_HOST = process.env.DB_HOST || 'postgres';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_NAME = process.env.DB_NAME || 'appdb';
const DB_USER = process.env.DB_USER || 'appuser';
const DB_PASSWORD = process.env.DB_PASSWORD || 'changeme';

async function dbCheck() {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    connectionTimeoutMillis: 2000
  });
  try {
    await client.connect();
    const result = await client.query('SELECT 1 AS ok');
    return result.rows[0].ok === 1;
  } finally {
    await client.end().catch(() => {});
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({status:'ok', service:'backend'}));
    return;
  }

  if (req.url === '/api/health') {
    let database = false;
    try { database = await dbCheck(); } catch (_) {}
    res.writeHead(database ? 200 : 503, {'Content-Type':'application/json'});
    res.end(JSON.stringify({status: database ? 'ok' : 'degraded', service:'backend', database}));
    return;
  }

  res.writeHead(404, {'Content-Type':'application/json'});
  res.end(JSON.stringify({error:'not found'}));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on ${PORT}`);
});
