import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: programs, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: programs })
  } catch (error: any) {
    console.error('Failed to fetch programs:', error)
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
    const { name, handle, perk_program_id, api_key, branding } = body
    
    if (!name || !handle || !perk_program_id || !api_key) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if handle already exists
    const { data: existing } = await supabase
      .from('programs')
      .select('handle')
      .eq('handle', handle)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Handle already exists' },
        { status: 400 }
      )
    }

    // Create the program
    const { data: program, error: insertError } = await supabase
      .from('programs')
      .insert({
        name,
        handle: handle.toLowerCase().replace(/[^a-z0-9-]/g, ''), // Sanitize handle
        perk_program_id,
        api_key,
        branding: branding || {},
        is_active: true,
        settings: {}
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      data: program,
      message: 'Program created successfully'
    })
  } catch (error: any) {
    console.error('Failed to create program:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}