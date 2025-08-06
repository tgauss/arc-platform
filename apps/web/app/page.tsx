import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          ARC Platform
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Activity Reward Channel - Build custom experiences for Perk programs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/login" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
            <h2 className="mb-3 text-2xl font-semibold">
              Admin Login{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Access the admin dashboard to manage programs and activities
            </p>
          </Link>

          <div className="group rounded-lg border border-transparent px-5 py-4 bg-gray-100 opacity-50 cursor-not-allowed">
            <h2 className="mb-3 text-2xl font-semibold">
              Documentation
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Learn how to build and deploy custom experiences
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 bg-gray-100 opacity-50 cursor-not-allowed">
            <h2 className="mb-3 text-2xl font-semibold">
              API Reference
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Explore the ARC API for advanced integrations
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Internal tool for Perk team members only
          </p>
        </div>
      </div>
    </div>
  )
}