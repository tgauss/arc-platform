'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Program, programQueries } from '@/lib/supabase'

type ActivityType = 'QUIZ' | 'SURVEY' | 'GAME' | 'DEMO' | 'CUSTOM'

interface ActivityForm {
  title: string
  description: string
  type: ActivityType
  program_id: string
  points_value: number
  ai_prompt: string
  config: Record<string, any>
  status?: string
}

const ACTIVITY_TYPES = [
  {
    type: 'QUIZ' as ActivityType,
    name: 'Quiz',
    icon: '🧠',
    description: 'Multiple choice questions with correct answers',
    examples: ['Product knowledge quiz', 'Brand awareness quiz', 'Educational quiz']
  },
  {
    type: 'SURVEY' as ActivityType,
    name: 'Survey',
    icon: '📋',
    description: 'Collect opinions and feedback from users',
    examples: ['Product feedback', 'Customer satisfaction', 'Market research']
  },
  {
    type: 'GAME' as ActivityType,
    name: 'Interactive Game',
    icon: '🎮',
    description: 'Engaging games and challenges',
    examples: ['Spin wheel', 'Memory game', 'Trivia challenge']
  },
  {
    type: 'DEMO' as ActivityType,
    name: 'Product Demo',
    icon: '🎬',
    description: 'Interactive product demonstrations',
    examples: ['Feature walkthrough', 'Tutorial', 'How-to guide']
  }
]

export default function CreateActivityPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null)
  const [useAI, setUseAI] = useState(true)
  const [formData, setFormData] = useState<ActivityForm>({
    title: '',
    description: '',
    type: 'QUIZ',
    program_id: '',
    points_value: 50,
    ai_prompt: '',
    config: {}
  })
  const [step, setStep] = useState(1) // 1: Type Selection, 2: Details, 3: AI Generation, 4: Review
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const { data, error } = await programQueries.getAll()
      if (error) throw error
      setPrograms(data || [])
      
      // Auto-select first program if only one exists
      if (data && data.length === 1) {
        setFormData(prev => ({ ...prev, program_id: data[0].id }))
      }
    } catch (error) {
      console.error('Failed to load programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeSelection = (type: ActivityType) => {
    setSelectedType(type)
    setFormData(prev => ({ ...prev, type }))
    setStep(2)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'points_value' ? parseInt(value) || 0 : value 
    }))
  }

  const generateWithAI = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/activities/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          prompt: formData.ai_prompt,
          program_id: formData.program_id
        })
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setGeneratedContent(result.data)
      setStep(4)
    } catch (error: any) {
      console.error('AI generation failed:', error)
      alert('Failed to generate activity: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const saveActivity = async () => {
    try {
      const activityData = {
        ...formData,
        config: generatedContent || formData.config,
        ai_generated: useAI,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        action_title: `Completed ${formData.title}`,
        status: 'DRAFT'
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      // Redirect to activities list
      window.location.href = '/dashboard/activities'
    } catch (error: any) {
      console.error('Failed to save activity:', error)
      alert('Failed to save activity: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-8 w-64"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/dashboard/activities" className="text-gray-400 hover:text-gray-500">
                Activities
              </Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-500">Create Activity</span>
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Create New Activity</h1>
        <p className="mt-2 text-gray-600">
          {useAI ? 'Use AI to generate engaging activities' : 'Manually create your activity'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {['Select Type', 'Add Details', useAI ? 'AI Generation' : 'Manual Setup', 'Review & Save'].map((stepName, index) => (
              <li key={stepName} className={`flex items-center ${index < 3 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className={`flex items-center text-sm ${step > index + 1 ? 'text-primary-600' : step === index + 1 ? 'text-primary-600' : 'text-gray-500'}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    step > index + 1 
                      ? 'bg-primary-600 border-primary-600' 
                      : step === index + 1 
                      ? 'border-primary-600' 
                      : 'border-gray-300'
                  }`}>
                    {step > index + 1 ? (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={step === index + 1 ? 'text-primary-600' : 'text-gray-500'}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span className="ml-2 font-medium">{stepName}</span>
                </div>
                {index < 3 && (
                  <div className={`hidden sm:block w-5 h-0.5 ml-4 ${step > index + 1 ? 'bg-primary-600' : 'bg-gray-300'}`} />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step 1: Activity Type Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Activity Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleTypeSelection(type.type)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <div className="text-3xl mb-3">{type.icon}</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong>
                    <ul className="mt-1 space-y-1">
                      {type.examples.slice(0, 2).map((example, i) => (
                        <li key={i}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="useAI"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded border-gray-300"
            />
            <label htmlFor="useAI" className="text-sm font-medium text-blue-900">
              Use AI to generate content automatically
            </label>
            <div className="flex-1 text-xs text-blue-700">
              AI will create questions, answers, and content based on your requirements
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Activity Details */}
      {step === 2 && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="program_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Program *
                </label>
                <select
                  id="program_id"
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Product Knowledge Quiz"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief description of what this activity is about"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="points_value" className="block text-sm font-medium text-gray-700 mb-1">
                  Points Value
                </label>
                <input
                  type="number"
                  id="points_value"
                  name="points_value"
                  value={formData.points_value}
                  onChange={handleInputChange}
                  min="0"
                  max="1000"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <p className="mt-1 text-sm text-gray-500">Points users earn for completing this activity</p>
              </div>

              {useAI && (
                <div>
                  <label htmlFor="ai_prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    AI Instructions *
                  </label>
                  <textarea
                    id="ai_prompt"
                    name="ai_prompt"
                    value={formData.ai_prompt}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe what you want the AI to create. Be specific about topics, difficulty level, number of questions, etc."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Example: "Create 5 multiple choice questions about skincare routine basics, suitable for beginners"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.title || !formData.program_id || (useAI && !formData.ai_prompt)}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {useAI ? 'Generate with AI' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Generation */}
      {step === 3 && useAI && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Content Generation</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Generation Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Type:</strong> {selectedType}</div>
              <div><strong>Title:</strong> {formData.title}</div>
              <div><strong>Points:</strong> {formData.points_value}</div>
              <div><strong>Instructions:</strong> {formData.ai_prompt}</div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              disabled={generating}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={generateWithAI}
              disabled={generating}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {generating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Activity'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Save */}
      {step === 4 && (
        <div className="max-w-4xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Save Activity</h2>
          
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{formData.title}</h3>
            {formData.description && (
              <p className="text-gray-600 mb-4">{formData.description}</p>
            )}
            
            {generatedContent && (
              <div className="space-y-4">
                <div className="text-sm text-green-600 font-medium">
                  ✨ Generated by AI
                </div>
                
                {/* Preview generated content */}
                <div className="bg-gray-50 rounded p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {JSON.stringify(generatedContent, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(useAI ? 3 : 2)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <div className="space-x-3">
              <button
                onClick={saveActivity}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Save as Draft
              </button>
              <button
                onClick={() => {
                  formData.status = 'PUBLISHED'
                  saveActivity()
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}