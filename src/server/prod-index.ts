import express from 'express';
import { createServerApp } from './app';
import { join } from 'node:path';

const port = Number(process.env.PORT ?? 3000);
const dbPath = process.env.EBS_DB_PATH ?? 'ebs.sqlite';
const distDir = join(process.cwd(), 'dist');

const app = createServerApp({ databasePath: dbPath });

// Serve static files from dist
app.use(express.static(distDir, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Handle SPA routing - serve index.html for all non-API routes
app.get(/.*/, (request, response) => {
  if (request.path.startsWith('/api')) {
    return;
  }
  response.sendFile(join(distDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`EBS production server listening on http://0.0.0.0:${port}`);
  console.log(`Database: ${dbPath}`);
  console.log(`Static files: ${distDir}`);
});
