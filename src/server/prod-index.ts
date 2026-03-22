import express from 'express';
import { createServerApp } from './app';
import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const port = Number(process.env.PORT ?? 3000);
const dbPath = process.env.EBS_DB_PATH ?? 'ebs.sqlite';
const distDir = resolve(process.cwd(), 'dist');
const indexHtmlPath = join(distDir, 'index.html');

// Read index.html once at startup
const indexHtmlContent = readFileSync(indexHtmlPath, 'utf-8');

const app = createServerApp({ databasePath: dbPath });

// Serve static files from dist
app.use(express.static(distDir));

// Handle SPA routing - serve index.html for all non-API routes
app.use((request, response) => {
  // Skip API routes (should not reach here, but just in case)
  if (request.path.startsWith('/api')) {
    return response.status(404).json({ error: 'API route not found' });
  }
  
  // For SPA, always serve index.html content directly
  response.type('text/html').send(indexHtmlContent);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`EBS production server listening on http://0.0.0.0:${port}`);
  console.log(`Database: ${dbPath}`);
  console.log(`Static files: ${distDir}`);
});
