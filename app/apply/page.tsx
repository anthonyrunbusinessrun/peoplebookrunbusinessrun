import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ApplicationForm from '@/components/ApplicationForm'
import { getRoles } from '@/lib/airtable'
export default async function ApplyPage() {
  const roles = await getRoles()
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-crimson-500 text-sm tracking-widest uppercase font-bold">Join the Team</span>
          <h1 className="text-4xl font-serif text-navy-900 mt-2 mb-4">Apply to Ray Land Inc.</h1>
          <p className="text-gray-500">Our team reviews every submission personally.</p>
        </div>
        <ApplicationForm roles={roles.filter((r: any) => r.status === 'Open')} />
      </div>
      <Footer />
    </main>
  )
}
