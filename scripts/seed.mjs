/**
 * Seed runner.
 * Executes supabase/seed/seed.sql against your database using the service role.
 *
 * Usage:
 *   1) Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *   2) EITHER paste supabase/seed/seed.sql into the Supabase SQL Editor and run it,
 *      OR use the Supabase CLI:  supabase db execute --file supabase/seed/seed.sql
 *
 * This script simply prints guidance because seeding is safest via the SQL editor
 * or CLI (which handle the DO $$ blocks correctly).
 */
import { readFileSync } from 'node:fs';
const sql = readFileSync(new URL('../supabase/seed/seed.sql', import.meta.url), 'utf8');
console.log('--- DevYatra seed.sql loaded (%d bytes) ---', sql.length);
console.log('Run it in Supabase SQL Editor, or:');
console.log('  supabase db execute --file supabase/seed/seed.sql');
