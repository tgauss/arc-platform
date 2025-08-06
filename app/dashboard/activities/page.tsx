'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, activityQueries } from '@/lib/supabase'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const { data, error } = await activityQueries.getAll()
      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'QUIZ':
        return '🧠'
      case 'SURVEY':
        return '📋'
      case 'GAME':
        return '🎮'
      case 'DEMO':
        return '🎬'
      case 'CUSTOM':
        return '⚡'
      default:
        return '📝'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage quizzes, surveys, games and other interactive experiences
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/activities/create"
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            Create Activity
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first activity.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/activities/create"
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Activity
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                          {getTypeIcon(activity.type)}
                        </div>
                      </div>
                      <div className="ml-4 truncate">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          {activity.ai_generated && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              AI Generated
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>
                            {/* @ts-ignore */}
                            {activity.programs?.name} • {activity.type} • {activity.points_value} points
                          </span>
                          {activity.description && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="truncate max-w-md">
                                {activity.description}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                      <div className="text-right text-sm text-gray-500">
                        <div className="font-medium">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          {activity.published_at 
                            ? `Published ${new Date(activity.published_at).toLocaleDateString()}`
                            : 'Not published'
                          }
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/activities/${activity.id}`}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button className="text-gray-400 hover:text-gray-500">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}