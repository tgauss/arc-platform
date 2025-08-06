/**
 * Test script to debug program creation
 */

// Test the API endpoint directly
async function testProgramCreation() {
  console.log('🧪 Testing Program Creation API...')

  const testProgram = {
    name: 'Test Program',
    handle: 'testprogram',
    perk_program_id: 'pgm_test_123',
    api_key: 'test_api_key_123'
  }

  try {
    console.log('📤 Sending request to /api/programs')
    console.log('Data:', testProgram)

    const response = await fetch('https://perk.ooo/api/programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProgram)
    })

    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

    const result = await response.json()
    console.log('📦 Response data:', result)

    if (result.success) {
      console.log('✅ Program creation successful!')
      console.log('New program ID:', result.data?.id)
    } else {
      console.log('❌ Program creation failed!')
      console.log('Error:', result.error)
    }

  } catch (error) {
    console.error('💥 Network/Parse error:', error.message)
  }
}

// Also test direct database connection
async function testDirectDatabase() {
  console.log('\n🗄️ Testing Direct Database Connection...')
  
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = 'https://nxveqgazvhjkohenouzw.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dmVxZ2F6dmhqa29oZW5vdXp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ2MTE0MCwiZXhwIjoyMDcwMDM3MTQwfQ.mADnHDbKGRJA9M1a6LKnK9KllT4uiczxTwn34D_MmJM'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try to insert directly
    const { data, error } = await supabase
      .from('programs')
      .insert({
        name: 'Direct Test Program',
        handle: 'directtest',
        perk_program_id: 'pgm_direct_456',
        api_key: 'direct_test_key',
        branding: {},
        is_active: true,
        settings: {}
      })
      .select()

    if (error) {
      console.log('❌ Direct database insert failed:', error)
    } else {
      console.log('✅ Direct database insert successful!')
      console.log('Inserted data:', data)
    }

  } catch (error) {
    console.error('💥 Direct database error:', error.message)
  }
}

// Run tests
testProgramCreation().then(() => testDirectDatabase())