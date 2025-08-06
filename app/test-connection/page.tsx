'use client'

import { useState, useEffect } from 'react'

interface TestResult {
  success: boolean
  message?: string
  timestamp?: string
  supabaseProject?: string
  tests?: any
  error?: string
}

export default function TestConnectionPage() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-connection')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to call test API'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            🧪 ARC Platform Connection Test
          </h1>
          
          <div className="mb-6 text-center">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {result && (
            <div className="space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {result.success ? '✅' : '❌'}
                  </span>
                  <div>
                    <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? 'Connection Successful!' : 'Connection Failed'}
                    </h3>
                    <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message || result.error}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              {result.success && result.supabaseProject && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                  <h4 className="font-semibold text-blue-800 mb-2">Connection Details</h4>
                  <p className="text-blue-600 text-sm">
                    <strong>Supabase Project:</strong> {result.supabaseProject}
                  </p>
                  <p className="text-blue-600 text-sm">
                    <strong>Test Time:</strong> {result.timestamp}
                  </p>
                </div>
              )}

              {/* Test Results */}
              {result.tests && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Test Results</h4>
                  
                  {/* Programs Test */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="font-medium text-gray-700 mb-2">📊 Programs Table</h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Found {result.tests.programs?.count} programs
                    </p>
                    {result.tests.programs?.data && (
                      <ul className="text-sm text-gray-600 space-y-1">
                        {result.tests.programs.data.map((program: any, i: number) => (
                          <li key={i}>• {program.name} ({program.handle})</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Test Activity */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="font-medium text-gray-700 mb-2">🧪 Test Activity</h5>
                    {result.tests.testActivity?.found ? (
                      <div className="text-sm text-gray-600">
                        <p><strong>Title:</strong> {result.tests.testActivity.data.title}</p>
                        <p><strong>Description:</strong> {result.tests.testActivity.data.description}</p>
                        <p><strong>Points:</strong> {result.tests.testActivity.data.points_value}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(result.tests.testActivity.data.created_at).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-600">Test activity not found</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="font-medium text-gray-700 mb-2">📈 Database Totals</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Programs:</strong> {result.tests.totals?.programs}
                      </div>
                      <div>
                        <strong>Activities:</strong> {result.tests.totals?.activities}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {!result.success && result.error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                  <h4 className="font-semibold text-red-800 mb-2">Error Details</h4>
                  <pre className="text-sm text-red-600 whitespace-pre-wrap">
                    {result.error}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}