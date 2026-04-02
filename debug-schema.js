const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log('--- Database Schema Check ---');
    
    // Check 'notes' columns
    console.log('\nChecking columns in "notes":');
    const { data: n1, error: e1 } = await supabase.from('notes').select('*').limit(1);
    if (n1 && n1.length > 0) {
        console.log('Columns:', Object.keys(n1[0]));
    } else if (e1) {
        console.error('Error:', e1.message);
    } else {
        console.log('Table exists but is empty.');
    }

    // Check 'summaries' columns
    console.log('\nChecking columns in "summaries":');
    const { data: s1, error: er1 } = await supabase.from('summaries').select('*').limit(1);
    if (s1 && s1.length > 0) {
        console.log('Columns:', Object.keys(s1[0]));
    } else if (er1) {
        console.error('Error:', er1.message);
    } else {
        console.log('Table exists but is empty.');
    }
}

checkSchema();
