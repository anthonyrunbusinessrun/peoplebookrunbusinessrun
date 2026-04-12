import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import JobBoard from '@/components/JobBoard'
import Footer from '@/components/Footer'
import { getRoles } from '@/lib/airtable'
export const revalidate = 300
export default async function HomePage() {
  const roles = await getRoles()
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero roles={roles} />
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
        <JobBoard roles={roles} />
      </Suspense>
      <Footer />
    </main>
  )
}
