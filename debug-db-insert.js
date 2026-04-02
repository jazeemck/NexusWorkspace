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

async function testInsert() {
    console.log('--- Testing Note Insertion ---');
    
    // 1. Try with a fake UUID
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    console.log(`Trying insert with UUID: ${fakeUuid}`);
    const { error: e1 } = await supabase.from('notes').insert({
        user_id: fakeUuid,
        title: 'Diagnostic Test Note',
        content: { type: 'doc', content: [] },
        tags: ['test'],
        folder: 'System',
    });
    
    if (e1) {
        console.error('❌ Insert with UUID failed:', e1.message);
    } else {
        console.log('✅ Insert with UUID succeeded (RLS is likely OFF).');
    }

    // 2. Try with a NON-UUID (like a Google ID or email)
    const fakeGoogleId = 'google-id-' + Math.random();
    console.log(`\nTrying insert with NON-UUID: ${fakeGoogleId}`);
    const { error: e2 } = await supabase.from('notes').insert({
        user_id: fakeGoogleId,
        title: 'Diagnostic Test Note Non-UUID',
    });
    
    if (e2) {
        console.error('❌ Insert with Non-UUID failed:', e2.message);
    } else {
        console.log('✅ Insert with Non-UUID succeeded. (This means user_id is TEXT, not UUID!)');
    }
}

testInsert();
