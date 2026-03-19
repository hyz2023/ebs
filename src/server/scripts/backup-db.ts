import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const source = resolve(process.env.EBS_DB_PATH ?? 'ebs.sqlite');
const targetDir = resolve(process.env.EBS_BACKUP_DIR ?? 'backups');

if (!existsSync(source)) {
  console.error(`Database file not found: ${source}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

const timestamp = new Date().toISOString().replaceAll(':', '-');
const target = join(targetDir, `ebs-${timestamp}.sqlite`);

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

console.log(`Backup written to ${target}`);
