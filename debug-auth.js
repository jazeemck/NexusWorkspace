const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple env loader
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const parts = line.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      return [key, val];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersTable() {
    console.log('--- Database Diagnostic ---');
    console.log('URL:', supabaseUrl);
    console.log('Key Type:', env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error accessing users table:', JSON.stringify(error, null, 2));
            if (error.code === '42P01') {
                console.log('💡 Table "users" does not exist. You need to run the SQL in fix_db.sql');
            } else if (error.code === '42501') {
                console.log('💡 Permission denied. RLS might be enabled and blocking the ANON key.');
            }
        } else {
            console.log('✅ Successfully accessed users table.');
            console.log('Data sample:', data);
        }
    } catch (err) {
        console.error('Crash during access:', err);
    }
}

checkUsersTable();
