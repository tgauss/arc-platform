import Link from 'next/link'

export default function SimpleCreatePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
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
              <span className="text-gray-500">Create Activity (Simple)</span>
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Create New Activity</h1>
        <p className="mt-2 text-gray-600">
          Simple activity creation page to test routing.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Creation</h2>
        <p className="text-gray-600 mb-4">
          This is a simplified version to test if the routing is working correctly.
        </p>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Activity Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter activity title"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Activity Type
            </label>
            <select
              id="type"
              name="type"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select type</option>
              <option value="QUIZ">Quiz</option>
              <option value="SURVEY">Survey</option>
              <option value="GAME">Game</option>
              <option value="DEMO">Demo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/activities"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}