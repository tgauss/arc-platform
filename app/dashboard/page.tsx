'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Program, Activity, ProgramUsage, programQueries, activityQueries, usageQueries } from '@/lib/supabase'

interface DashboardStats {
  totalPrograms: number
  activePrograms: number
  totalActivities: number
  totalPointsAwarded: number
  totalCompletions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [usageData, setUsageData] = useState<ProgramUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load programs
      const { data: programsData, error: programsError } = await programQueries.getAll()
      if (programsError) throw programsError

      // Load activities
      const { data: activitiesData, error: activitiesError } = await activityQueries.getAll()
      if (activitiesError) throw activitiesError

      // Load current month usage
      const { data: usageCurrentMonth, error: usageError } = await usageQueries.getCurrentMonth()
      if (usageError) throw usageError

      // Calculate stats
      const activePrograms = programsData?.filter(p => p.is_active).length || 0
      const totalPointsAwarded = usageCurrentMonth?.reduce((sum, usage) => sum + usage.points_awarded, 0) || 0
      const totalCompletions = usageCurrentMonth?.reduce((sum, usage) => sum + usage.completions, 0) || 0

      setPrograms(programsData || [])
      setRecentActivities(activitiesData?.slice(0, 5) || [])
      setUsageData(usageCurrentMonth || [])
      setStats({
        totalPrograms: programsData?.length || 0,
        activePrograms,
        totalActivities: activitiesData?.length || 0,
        totalPointsAwarded,
        totalCompletions
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-8 w-48"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 shadow rounded-lg">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Programs
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats?.activePrograms} / {stats?.totalPrograms}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Activities
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats?.totalActivities}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Points Awarded (This Month)
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats?.totalPointsAwarded.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completions (This Month)
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats?.totalCompletions.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Overview */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Programs List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Programs</h2>
            <Link 
              href="/dashboard/programs"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {programs.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No programs found
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {programs.map((program) => {
                  const usage = usageData.find(u => u.program_id === program.id)
                  return (
                    <li key={program.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: program.branding?.primaryColor || '#3B82F6' }}
                            ></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {program.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {program.handle}.perk.ooo
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {usage?.completions || 0} completions
                          </p>
                          <p className="text-xs text-gray-500">
                            {usage?.views || 0} views this month
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            <Link 
              href="/dashboard/activities"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {recentActivities.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No activities found
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {/* @ts-ignore */}
                          {activity.programs?.name} • {activity.type} • {activity.points_value} pts
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}