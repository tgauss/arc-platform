import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Check if we can connect and query programs
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('handle, name')
      .limit(3)

    if (programsError) {
      throw programsError
    }

    // Test 2: Look for our test activity
    const { data: testActivity, error: activityError } = await supabase
      .from('activities')
      .select('title, description, points_value, created_at')
      .eq('slug', 'connection-test')
      .single()

    if (activityError) {
      throw activityError
    }

    // Test 3: Get total counts
    const { count: totalPrograms } = await supabase
      .from('programs')
      .select('*', { count: 'exact' })

    const { count: totalActivities } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })

    return NextResponse.json({
      success: true,
      message: '🎉 Vercel-Supabase connection verified!',
      timestamp: new Date().toISOString(),
      supabaseProject: supabaseUrl,
      tests: {
        programs: {
          success: true,
          count: totalPrograms,
          data: programs
        },
        testActivity: {
          success: true,
          found: !!testActivity,
          data: testActivity
        },
        totals: {
          programs: totalPrograms,
          activities: totalActivities
        }
      }
    })

  } catch (error: any) {
    console.error('Connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}