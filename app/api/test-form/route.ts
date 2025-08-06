import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 Form submission received:', body)
    console.log('📅 Timestamp:', new Date().toISOString())
    console.log('📍 Headers:', Object.fromEntries(request.headers.entries()))
    
    return NextResponse.json({
      success: true,
      message: 'Form test successful',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Form test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}