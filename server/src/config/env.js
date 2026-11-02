import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { envSchema } from '../schemas/env.schema.js';

// Resolve directory of current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root or parent
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map(
    (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
  ).join('\n');

  console.error('\n❌ Fatal Environment Configuration Error:\n' + issues + '\n');
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parsed.success ? parsed.data : process.env;

