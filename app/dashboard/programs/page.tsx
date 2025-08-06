'use client'

import { useState, useEffect } from 'react'
import { Program, programQueries, activityQueries, usageQueries } from '@/lib/supabase'

interface ProgramWithStats extends Program {
  activity_count: number
  total_completions: number
  total_views: number
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProgram, setShowNewProgram] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    perk_program_id: '',
    api_key: ''
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      // Load programs
      const { data: programsData, error: programsError } = await programQueries.getAll()
      if (programsError) throw programsError

      // For each program, get activity count and usage stats
      const programsWithStats = await Promise.all(
        programsData?.map(async (program) => {
          // Count activities for this program
          const { data: activities, error: activitiesError } = await activityQueries.getByProgram(program.id)
          if (activitiesError) console.error('Error loading activities:', activitiesError)

          // Get usage stats for this program
          const { data: usage, error: usageError } = await usageQueries.getByProgram(program.id)
          if (usageError) console.error('Error loading usage:', usageError)

          const totalCompletions = usage?.reduce((sum, u) => sum + u.completions, 0) || 0
          const totalViews = usage?.reduce((sum, u) => sum + u.views, 0) || 0

          return {
            ...program,
            activity_count: activities?.length || 0,
            total_completions: totalCompletions,
            total_views: totalViews
          }
        }) || []
      )

      setPrograms(programsWithStats)
    } catch (error) {
      console.error('Failed to load programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    try {
      // Validate form
      if (!formData.name || !formData.handle || !formData.perk_program_id || !formData.api_key) {
        throw new Error('All fields are required')
      }

      // Submit to API
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create program')
      }

      // Success - reload programs and close modal
      await loadPrograms()
      setShowNewProgram(false)
      setFormData({ name: '', handle: '', perk_program_id: '', api_key: '' })
    } catch (error: any) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate handle from name
    if (name === 'name') {
      const handle = value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
      setFormData(prev => ({ ...prev, handle }))
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage Perk programs and their custom experiences
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowNewProgram(true)}
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Add Program
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Program
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Handle
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Activities
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Views
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Completions
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    // Loading skeleton
                    [...Array(3)].map((_, i) => (
                      <tr key={i}>
                        <td className="py-4 pl-4 pr-3 sm:pl-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16"></div>
                        </td>
                        <td className="pr-4 sm:pr-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                        </td>
                      </tr>
                    ))
                  ) : programs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <h3 className="text-sm font-medium text-gray-900">No programs</h3>
                          <p className="mt-1 text-sm text-gray-500">Get started by creating a new program.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    programs.map((program) => (
                      <tr key={program.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: program.branding?.primaryColor || '#3B82F6' }}
                            ></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {program.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {program.perk_program_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <a 
                            href={`https://${program.handle}.perk.ooo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            {program.handle}.perk.ooo
                          </a>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {program.activity_count}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {program.total_views.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {program.total_completions.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            program.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {program.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button className="text-primary-600 hover:text-primary-900 mr-4">
                            Edit
                          </button>
                          <button className="text-gray-400 hover:text-gray-500">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showNewProgram && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Program</h3>
            
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Program Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Game Face Grooming"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                  Subdomain Handle *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="handle"
                    id="handle"
                    value={formData.handle}
                    onChange={handleInputChange}
                    className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="gameface"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    .perk.ooo
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Letters, numbers, and hyphens only</p>
              </div>
              
              <div>
                <label htmlFor="perk_program_id" className="block text-sm font-medium text-gray-700">
                  Perk Program ID *
                </label>
                <input
                  type="text"
                  name="perk_program_id"
                  id="perk_program_id"
                  value={formData.perk_program_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="pgm_123456"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
                  Perk API Key *
                </label>
                <input
                  type="password"
                  name="api_key"
                  id="api_key"
                  value={formData.api_key}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter your Perk API key"
                  required
                />
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Add Program'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProgram(false)
                    setFormError('')
                    setFormData({ name: '', handle: '', perk_program_id: '', api_key: '' })
                  }}
                  disabled={submitting}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}