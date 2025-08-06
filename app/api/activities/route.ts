import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        programs!inner(name, handle)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: activities })
  } catch (error: any) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Validate required fields
    const { title, type, program_id, points_value, action_title } = body
    
    if (!title || !type || !program_id || points_value === undefined || !action_title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = body.slug || title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)

    // Check if slug already exists for this program
    const { data: existing } = await supabase
      .from('activities')
      .select('slug')
      .eq('program_id', program_id)
      .eq('slug', slug)
      .single()

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    // Prepare activity data
    const activityData = {
      program_id,
      type,
      slug: finalSlug,
      title,
      description: body.description || null,
      config: body.config || {},
      styling: body.styling || {},
      ai_generated: body.ai_generated || false,
      ai_prompt: body.ai_prompt || null,
      status: body.status || 'DRAFT',
      published_at: body.status === 'PUBLISHED' ? new Date().toISOString() : null,
      points_value,
      action_title,
      completion_limit: body.completion_limit || 1
    }

    console.log('📝 Creating activity:', { title, type, program_id, status: activityData.status })

    // Create the activity
    const { data: activity, error: insertError } = await supabase
      .from('activities')
      .insert(activityData)
      .select(`
        *,
        programs!inner(name, handle)
      `)
      .single()

    if (insertError) throw insertError

    console.log('✅ Activity created successfully:', activity.id)

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity created successfully'
    })
  } catch (error: any) {
    console.error('Failed to create activity:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}