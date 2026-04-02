const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple env loader
let env = {};
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  env = Object.fromEntries(
    envContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const parts = line.split('=');
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        return [key, val];
      })
  );
} catch (e) {
  console.error('Error loading .env.local:', e.message);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- Database Diagnostic ---');
    console.log('URL:', supabaseUrl);
    console.log('Key Type:', env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');

    const tables = ['users', 'notes', 'summaries'];
    
    for (const table of tables) {
        console.log(`\nChecking table: ${table}...`);
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.error(`❌ Error accessing ${table}:`, error.message);
                if (error.code === '42P01') console.log(`💡 Table "${table}" DOES NOT EXIST.`);
                if (error.code === '42501') console.log(`💡 Permission denied (RLS).`);
            } else {
                console.log(`✅ Table "${table}" exists and is accessible.`);
            }
        } catch (err) {
            console.error(`Crash checking ${table}:`, err.message);
        }
    }

    console.log('\n--- Gemini Diagnostic ---');
    if (!env.GEMINI_API_KEY) {
        console.log('❌ GEMINI_API_KEY is missing.');
    } else {
        console.log('✅ GEMINI_API_KEY is present.');
    }

    console.log('\n--- Firecrawl Diagnostic ---');
    if (!env.FIRECRAWL_API_KEY) {
        console.log('❌ FIRECRAWL_API_KEY is missing.');
    } else {
        console.log('✅ FIRECRAWL_API_KEY is present.');
    }
}

diagnose();
